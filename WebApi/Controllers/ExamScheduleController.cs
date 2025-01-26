using Microsoft.AspNetCore.Mvc;
using WebApi.Dtos;
using WebApi.Repositories;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExamScheduleController : ControllerBase
    {
        private readonly IExamScheduleRepository _examRepository;

        public ExamScheduleController(IExamScheduleRepository examRepository)
        {
            _examRepository = examRepository;
        }

        [HttpPost("CreateExamSchedule")]
        public async Task<ActionResult<ExamScheduleResponse>> CreateExamSchedule([FromBody] ExamScheduleRequest request)
        {
            var result = await _examRepository.CreateOrUpdateExamScheduleAsync(request);
            return Ok(result);
        }

        [HttpPut("UpdateExamSchedule/{id}")]
        public async Task<ActionResult<ExamScheduleResponse>> UpdateExamSchedule(int id, [FromBody] ExamScheduleRequest request)
        {
            try
            {
                var result = await _examRepository.CreateOrUpdateExamScheduleAsync(request, id);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet("GetExamSchedule/{scheduleId}")]
        public async Task<ActionResult<ExamScheduleResponse>> GetExamSchedule(int scheduleId)
        {
            var result = await _examRepository.GetExamScheduleByIdAsync(scheduleId);
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        [HttpGet("GetExamSchedules")]
        public async Task<ActionResult<List<ExamScheduleResponse>>> GetExamSchedules()
        {
            var result = await _examRepository.GetExamSchedules();
            return Ok(result);
        }

        [HttpDelete("DeleteExamSchedule/{scheduleId}")]
        public async Task<IActionResult> DeleteExamSchedule(int scheduleId)
        {
            await _examRepository.DeleteExamScheduleAsync(scheduleId);
            return NoContent();
        }

    }
}