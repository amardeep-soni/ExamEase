using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.TextGeneration;

public class GoogleAITextGenerationService : ITextGenerationService
{
    private readonly string _apiKey;
    private readonly string _modelId;
    private readonly HttpClient _httpClient;

    public GoogleAITextGenerationService(string modelId, string apiKey)
    {
        _apiKey = apiKey;
        _modelId = modelId;
        _httpClient = new HttpClient();
    }

    public IReadOnlyDictionary<string, object?> Attributes => new Dictionary<string, object?>();

    public async Task<IReadOnlyList<TextContent>> GetTextContentsAsync(
        string prompt,
        PromptExecutionSettings? settings = null,
        Kernel? kernel = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(prompt))
        {
            throw new ArgumentException("Prompt cannot be null or whitespace.", nameof(prompt));
        }

        try
        {
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature =   0.7,
                    maxOutputTokens = 1024
                }
            };

            string json = JsonSerializer.Serialize(requestBody);
            var requestContent = new StringContent(json, Encoding.UTF8, "application/json");

            string url = $"https://generativelanguage.googleapis.com/v1beta/models/{_modelId}:generateContent?key={_apiKey}";
            var response = await _httpClient.PostAsync(url, requestContent, cancellationToken);
            string responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new ApplicationException($"Error generating text content: {response.StatusCode} - {responseContent}");
            }

            var jsonResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
            string generatedText = string.Empty;

            if (jsonResponse.TryGetProperty("candidates", out JsonElement candidates) &&
                candidates.ValueKind == JsonValueKind.Array &&
                candidates.GetArrayLength() > 0)
            {
                var candidate = candidates[0];

                if (candidate.TryGetProperty("content", out JsonElement contentElement))
                {
                    if (contentElement.ValueKind == JsonValueKind.String)
                    {
                        generatedText = contentElement.GetString() ?? string.Empty;
                    }
                    else if (contentElement.ValueKind == JsonValueKind.Object && contentElement.TryGetProperty("parts", out JsonElement parts))
                    {
                        generatedText = GetTextFromParts(parts);
                    }
                }
                else if (candidate.TryGetProperty("parts", out JsonElement parts))
                {
                    generatedText = GetTextFromParts(parts);
                }
            }

            return new List<TextContent> { new TextContent(generatedText) };
        }
        catch (Exception ex)
        {
            throw new ApplicationException("Error generating text content", ex);
        }
    }

    public async IAsyncEnumerable<StreamingTextContent> GetStreamingTextContentsAsync(
        string prompt,
        PromptExecutionSettings? settings = null,
        Kernel? kernel = null,
        [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(prompt))
        {
            throw new ArgumentException("Prompt cannot be null or whitespace.", nameof(prompt));
        }

        Console.WriteLine($"Starting streaming request for prompt: {prompt.Substring(0, Math.Min(50, prompt.Length))}...");

        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            },
            generationConfig = new
            {
                temperature = 0.7,
                maxOutputTokens = 1024
            }
        };

        string json = JsonSerializer.Serialize(requestBody);
        var requestContent = new StringContent(json, Encoding.UTF8, "application/json");

        string url = $"https://generativelanguage.googleapis.com/v1beta/models/{_modelId}:streamGenerateContent?key={_apiKey}";
        var request = new HttpRequestMessage(HttpMethod.Post, url);
        request.Content = requestContent;

        Console.WriteLine("Sending streaming request to Google AI API...");

        using var response = await _httpClient.SendAsync(
            request,
            HttpCompletionOption.ResponseHeadersRead,
            cancellationToken);

        Console.WriteLine($"Response status: {response.StatusCode}");
        response.EnsureSuccessStatusCode();

        using var stream = await response.Content.ReadAsStreamAsync();
        using var reader = new StreamReader(stream);

        int chunkCount = 0;
        StringBuilder fullResponse = new StringBuilder();

        string? line;
        while ((line = await reader.ReadLineAsync()) != null && !cancellationToken.IsCancellationRequested)
        {
            if (string.IsNullOrEmpty(line)) continue;

            if (line.StartsWith("data: "))
            {
                string jsonData = line.Substring(6).Trim();

                // Skip end-of-stream marker
                if (jsonData == "[DONE]")
                {
                    Console.WriteLine("Received [DONE] marker. Streaming complete.");
                    break;
                }

                var jsonResponse = JsonDocument.Parse(jsonData);
                var root = jsonResponse.RootElement;

                if (root.TryGetProperty("candidates", out JsonElement candidates) &&
                    candidates.ValueKind == JsonValueKind.Array &&
                    candidates.GetArrayLength() > 0)
                {
                    var candidate = candidates[0];

                    if (candidate.TryGetProperty("content", out JsonElement content) &&
                        content.TryGetProperty("parts", out JsonElement parts) &&
                        parts.ValueKind == JsonValueKind.Array &&
                        parts.GetArrayLength() > 0)
                    {
                        var part = parts[0];
                        if (part.TryGetProperty("text", out JsonElement textElement))
                        {
                            string text = textElement.GetString() ?? string.Empty;
                            if (!string.IsNullOrEmpty(text))
                            {
                                chunkCount++;
                                fullResponse.Append(text);
                                Console.WriteLine($"Chunk #{chunkCount}: {text}");
                                yield return new StreamingTextContent(text);
                            }
                        }
                    }
                }
            }
        }

        Console.WriteLine($"Streaming complete. Received {chunkCount} chunks.");
        Console.WriteLine($"Full response length: {fullResponse.Length} characters");
    }

    private string GetTextFromParts(JsonElement parts)
    {
        if (parts.ValueKind != JsonValueKind.Array)
            return string.Empty;

        var sb = new StringBuilder();
        foreach (var part in parts.EnumerateArray())
        {
            if (part.TryGetProperty("text", out JsonElement textElement))
            {
                sb.Append(textElement.GetString());
            }
        }
        return sb.ToString();
    }
}