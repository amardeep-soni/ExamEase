using Microsoft.AspNetCore.Mvc;
using WebApi.Dtos;
using WebApi.Services;
using System.IO;

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

        [HttpPost("UploadPdfNotes")]
        public async Task<IActionResult> UploadPdfNotes(IFormFile file, string documentId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is empty.");

            if (Path.GetExtension(file.FileName).ToLower() != ".pdf")
                return BadRequest("Only PDF files are allowed.");

            using (var stream = file.OpenReadStream())
            {
                await _aiService.UploadPdfNotesAsync(stream, documentId);
            }

            return Ok("PDF notes uploaded successfully.");
        }

        [HttpGet("AskQuestion")]
        public async Task<IActionResult> AskQuestion(string question)
        {
            var result = await _aiService.AskQuestionAsync(question);
            return Ok(result);
        }

        [HttpDelete("DeleteDocumentAsync")]
        public async Task<IActionResult> DeleteDocumentAsync(string documentId)
        {
            await _aiService.DeleteDocumentAsync(documentId);
            return Ok();
        }
    }

    public class AddDataRequest
    {
        public string Data { get; set; }
        public string DocumentId { get; set; }
    }
}
