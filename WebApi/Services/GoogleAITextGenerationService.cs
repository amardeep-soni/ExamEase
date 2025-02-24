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
            // Build the request body as per the Google docs example.
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
                }
            };

            string json = JsonSerializer.Serialize(requestBody);
            var requestContent = new StringContent(json, Encoding.UTF8, "application/json");

            // Use the v1beta endpoint with generateContent.
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
                // Get the first candidate.
                var candidate = candidates[0];

                // Option 1: Candidate has a "content" property that may wrap the parts.
                if (candidate.TryGetProperty("content", out JsonElement contentElement))
                {
                    // If "content" is a string, use it directly.
                    if (contentElement.ValueKind == JsonValueKind.String)
                    {
                        generatedText = contentElement.GetString() ?? string.Empty;
                    }
                    // Otherwise, check if "content" has a "parts" array.
                    else if (contentElement.ValueKind == JsonValueKind.Object && contentElement.TryGetProperty("parts", out JsonElement parts))
                    {
                        generatedText = GetTextFromParts(parts);
                    }
                }
                // Option 2: Candidate directly contains a "parts" array.
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

    private string GetTextFromParts(JsonElement parts)
    {
        if (parts.ValueKind == JsonValueKind.Array && parts.GetArrayLength() > 0)
        {
            var firstPart = parts[0];
            if (firstPart.TryGetProperty("text", out JsonElement textElement))
            {
                return textElement.GetString() ?? string.Empty;
            }
        }
        return string.Empty;
    }

    public async IAsyncEnumerable<StreamingTextContent> GetStreamingTextContentsAsync(
        string prompt,
        PromptExecutionSettings? settings = null,
        Kernel? kernel = null,
        [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var results = await GetTextContentsAsync(prompt, settings, kernel, cancellationToken);
        foreach (var result in results)
        {
            yield return new StreamingTextContent(result.Text);
        }
    }
}
