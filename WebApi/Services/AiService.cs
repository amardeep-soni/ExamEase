using System;
using Microsoft.KernelMemory;
using Microsoft.SemanticKernel;

namespace WebApi.Services
{
    public class AIService(Kernel _kernel, IKernelMemory _memory)
    {

        public async Task<string> GetAiAnswer(string question)
        {
            var searchResult = await _memory.SearchAsync(question, index: "default", minRelevance: 0.4, limit: 1);
            if (searchResult.NoResult == false)
            {
                var found = searchResult.Results[0].Partitions.FirstOrDefault();
                var documentId = searchResult.Results[0].DocumentId;
                return found.Text + '~' + documentId;
            }
            return "No relevant answer found.";
        }

        public async Task AddDataToMemory(string data, string documentId)
        {
            await _memory.ImportTextAsync(data, documentId, index: "default");
        }

        public async Task DeleteDataFromMemory(string documentId)
        {
            await _memory.DeleteDocumentAsync(documentId, index: "default");
        }
    }
}
