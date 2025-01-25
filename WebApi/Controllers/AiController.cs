using Microsoft.AspNetCore.Mvc;
using WebApi.Dtos;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AiController : ControllerBase
    {
        private readonly AIService _aiService;

        public AiController(AIService aiService)
        {
            _aiService = aiService;
        }

        [HttpGet("GetAiAnswer")]
        public async Task<IActionResult> GetAiAnswer(string question)
        {
            var result = await _aiService.GetAiAnswer(question);
            return Ok(result);
        }

        [HttpPost("AddDataToMemory")]
        public async Task<IActionResult> AddDataToMemory([FromBody] AddDataRequest request)
        {
            await _aiService.AddDataToMemory(request.Data, request.DocumentId);
            return Ok();
        }

        [HttpDelete("DeleteDataFromMemory")]
        public async Task<IActionResult> DeleteDataFromMemory(string documentId)
        {
            await _aiService.DeleteDataFromMemory(documentId);
            return Ok();
        }

        [HttpPost("GenerateStudyPlanTask")]
        public async Task<IActionResult> GenerateStudyPlanTask(ExamScheduleRequest examScheduleRequest)
        {
            var result = await _aiService.GenerateStudyPlanTask(examScheduleRequest);
            return Ok(result);
        }


    }

    public class AddDataRequest
    {
        public string Data { get; set; }
        public string DocumentId { get; set; }
    }
}
