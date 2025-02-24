using System.ComponentModel.DataAnnotations;

namespace WebApi.Model
{
    public class GoogleAIOptions
    {
        public string ApiKey { get; set; }
        public string ChatModelId { get; set; }
        public string EmbeddingModelId { get; set; }
    }
}
