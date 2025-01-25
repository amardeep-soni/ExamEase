using WebApi.Dtos;
using WebApi.Model;

namespace WebApi.IRepositories
{
    public interface IStudyPlanRepository
    {
        Task CreateStudyPlansAsync(List<StudyPlanRequest> studyPlanRequests, int examScheduleId);
        Task<StudyPlanDto> GetAllStudyPlansByExamScheduleIdAsync(int examScheduleId);
    }
}
