using WebApi.Dtos;

namespace WebApi.Repositories
{
    public interface IExamScheduleRepository
    {
        Task<ExamScheduleResponse> CreateOrUpdateExamScheduleAsync(ExamScheduleRequest request, int? id = null);
        Task<ExamScheduleResponse> GetExamScheduleByIdAsync(int id);
        Task<List<ExamScheduleResponse>> GetExamSchedulesByEmailAsync(string email);
        Task DeleteExamScheduleAsync(int id);
    }
} 