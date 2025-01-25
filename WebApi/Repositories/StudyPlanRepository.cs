using System.Text.Json;
using WebApi.Dtos;
using WebApi.Model;
using WebApi.Services;
using Microsoft.EntityFrameworkCore;
using WebApi.IRepositories;

namespace WebApi.Repositories
{

    public class StudyPlanRepository : IStudyPlanRepository
    {
        private readonly ApplicationDbContext _context;

        public StudyPlanRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task CreateStudyPlansAsync(List<StudyPlanRequest> studyPlanRequests, int examScheduleId)
        {
            var studyPlans = new List<StudyPlan>();

            foreach (var studyPlanRequest in studyPlanRequests)
            {
                var studyPlan = new StudyPlan
                {
                    ExamScheduleId = examScheduleId,
                    Plans = JsonSerializer.Serialize(studyPlanRequest)
                };
                studyPlans.Add(studyPlan);
            }

            await _context.StudyPlans.AddRangeAsync(studyPlans);
            await _context.SaveChangesAsync();
        }

        public async Task<StudyPlanDto> GetAllStudyPlansByExamScheduleIdAsync(int examScheduleId)
        {
            var studyPlans = await _context.StudyPlans
                .Where(sp => sp.ExamScheduleId == examScheduleId)
                .ToListAsync();

            if (studyPlans == null || !studyPlans.Any())
                return null;

            var studyPlanDto = new StudyPlanDto();
            studyPlanDto.ExamScheduleId = examScheduleId;
            studyPlanDto.Plans = studyPlans.Select(sp => JsonSerializer.Deserialize<StudyPlanRequest>(sp.Plans)).ToList();
            return studyPlanDto;
        }
    }
}
