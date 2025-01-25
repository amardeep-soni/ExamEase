using Microsoft.AspNetCore.Mvc;
using WebApi.Dtos;
using WebApi.IRepositories;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudyPlanController : ControllerBase
    {
        private readonly IStudyPlanRepository _studyPlanRepository;

        public StudyPlanController(IStudyPlanRepository studyPlanRepository)
        {
            _studyPlanRepository = studyPlanRepository;
        }

        [HttpGet("GetAllStudyPlansByExamScheduleId/{examScheduleId}")]
        public async Task<ActionResult<StudyPlanDto>> GetAllStudyPlansByExamScheduleId(int examScheduleId)
        {
            var studyPlan = await _studyPlanRepository.GetAllStudyPlansByExamScheduleIdAsync(examScheduleId);
            if (studyPlan == null)
            {
                return NotFound("No study plans found for the given exam schedule ID.");
            }

            return Ok(studyPlan);
        }
    }
}
