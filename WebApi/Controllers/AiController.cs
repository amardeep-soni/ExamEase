using Microsoft.AspNetCore.Mvc;
using WebApi.Dtos;
using WebApi.Services;
using System.IO;
using System.Linq;

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
        public async Task<ResponseMessage> GetAiAnswer(string question)
        {
            var result = await _aiService.GetAiAnswer(question);
            return new ResponseMessage { IsError = "false", Message = result };
        }

        [HttpPost("AddDataToMemory")]
        public async Task<ResponseMessage> AddDataToMemory([FromBody] AddDataRequest request)
        {
            await _aiService.AddDataToMemory(request.Data, request.DocumentId);
            return new ResponseMessage { IsError = "false", Message = "Data added to memory successfully." };
        }

        [HttpDelete("DeleteDataFromMemory")]
        public async Task<ResponseMessage> DeleteDataFromMemory(string documentId)
        {
            await _aiService.DeleteDataFromMemory(documentId);
            return new ResponseMessage { IsError = "false", Message = "Data deleted from memory successfully." };
        }

        [HttpPost("GenerateStudyPlanTask")]
        public async Task<ResponseMessage> GenerateStudyPlanTask(ExamScheduleRequest examScheduleRequest)
        {
            var result = await _aiService.GenerateStudyPlanTask(examScheduleRequest);
            return new ResponseMessage { IsError = "false", Message = "Study plan generated successfully." };
        }


        [HttpPost("UploadPdfNotes")]
        public async Task<ResponseMessage> UploadPdfNotes(List<IFormFile> files, string subject)
        {
            if (files == null || files.Count == 0)
                return new ResponseMessage { IsError = "true", Message = "No files uploaded." };

            var filePaths = new List<string>();

            foreach (var file in files)
            {
                if (Path.GetExtension(file.FileName).ToLower() != ".pdf")
                    return new ResponseMessage { IsError = "true", Message = "Only PDF files are allowed." };

                var fileName = Path.GetFileNameWithoutExtension(file.FileName);
                var extension = Path.GetExtension(file.FileName);
                var directory = Path.Combine("wwwroot", "subject");
                Directory.CreateDirectory(directory);

                var filePath = Path.Combine(directory, fileName + extension);
                var counter = 1;
                while (System.IO.File.Exists(filePath))
                {
                    filePath = Path.Combine(directory, $"{fileName}{counter}{extension}");
                    counter++;
                }

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                filePaths.Add(filePath);
            }

            await _aiService.AddDocumentToMemory(filePaths, subject);

            return new ResponseMessage { IsError = "false", Message = string.Join(", ", filePaths.Select(Path.GetFileName)) };
        }

        [HttpGet("AskQuestion")]
        public async Task<ResponseMessage> AskQuestion(string question, string subject)
        {
            var result = await _aiService.AskQuestionAsync(question, subject);
            return result;
        }

        [HttpDelete("DeleteDocumentAsync")]
        public async Task<ResponseMessage> DeleteDocumentAsync(List<string> documentIds)
        {
            await _aiService.DeleteDocumentsAsync(documentIds);
            return new ResponseMessage { IsError = "false", Message = "Documents deleted successfully." };
        }
    }

    public class AddDataRequest
    {
        public string Data { get; set; }
        public string DocumentId { get; set; }
    }
}
