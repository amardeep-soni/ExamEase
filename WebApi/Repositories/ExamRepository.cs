using Microsoft.EntityFrameworkCore;
using WebApi.Dtos;
using WebApi.Model;
using WebApi.Services;

namespace WebApi.Repositories
{
    public class ExamRepository : IExamScheduleRepository
    {
        private readonly ApplicationDbContext _context;

        public ExamRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ExamScheduleResponse> CreateOrUpdateExamScheduleAsync(ExamScheduleRequest request, int? id = null)
        {
            var examSchedule = new ExamScheduleRepository();

            if (id.HasValue)
            {
                // Update existing schedule
                examSchedule = await _context.ExamSchedules.FindAsync(id.Value);
                if (examSchedule == null)
                    throw new KeyNotFoundException($"ExamSchedule with ID {id} not found");

                examSchedule.Email = request.Email;
                examSchedule.DailyStudyHours = request.DailyStudyHours;
                examSchedule.ExamDate = request.ExamDate;

                // Delete existing subject times
                var existingSubjects = await _context.ExamSubjectTimes
                    .Where(e => e.ExamScheduleId == id.Value)
                    .ToListAsync();
                _context.ExamSubjectTimes.RemoveRange(existingSubjects);
            }
            else
            {
                // Create new schedule
                examSchedule = new ExamScheduleRepository
                {
                    Email = request.Email,
                    DailyStudyHours = request.DailyStudyHours,
                    ExamDate = request.ExamDate,
                    CreatedDate = DateTime.UtcNow
                };
                await _context.ExamSchedules.AddAsync(examSchedule);
            }

            await _context.SaveChangesAsync();

            // Create new ExamSubjectTimes
            var examSubjectTimes = request.ExamSubjectTimes.SelectMany(st =>
                st.TopicOrChapter.Select(topic => new ExamSubjectTime
                {
                    ExamScheduleId = examSchedule.Id,
                    Subject = st.Subject,
                    TopicOrChapter = topic,
                    ExamDateTime = st.ExamDateTime
                })
            ).ToList();

            await _context.ExamSubjectTimes.AddRangeAsync(examSubjectTimes);
            await _context.SaveChangesAsync();

            return await CreateResponseFromEntities(examSchedule, examSubjectTimes);
        }

        public async Task<ExamScheduleResponse> GetExamScheduleByIdAsync(int id)
        {
            var schedule = await _context.ExamSchedules
                .FirstOrDefaultAsync(e => e.Id == id);

            if (schedule == null)
                return null;

            var subjects = await _context.ExamSubjectTimes
                .Where(e => e.ExamScheduleId == id)
                .ToListAsync();

            return await CreateResponseFromEntities(schedule, subjects);
        }

        public async Task<List<ExamScheduleResponse>> GetExamSchedulesByEmailAsync(string email)
        {
            var schedules = await _context.ExamSchedules
                .Where(e => e.Email == email)
                .ToListAsync();

            var responses = new List<ExamScheduleResponse>();

            foreach (var schedule in schedules)
            {
                var subjects = await _context.ExamSubjectTimes
                    .Where(e => e.ExamScheduleId == schedule.Id)
                    .ToListAsync();

                responses.Add(await CreateResponseFromEntities(schedule, subjects));
            }

            return responses;
        }

        public async Task DeleteExamScheduleAsync(int id)
        {
            var schedule = await _context.ExamSchedules
                .FirstOrDefaultAsync(e => e.Id == id);

            if (schedule != null)
            {
                _context.ExamSchedules.Remove(schedule);
                await _context.SaveChangesAsync();
            }
        }

        private async Task<ExamScheduleResponse> CreateResponseFromEntities(ExamScheduleRepository schedule, List<ExamSubjectTime> subjects)
        {
            // Group subjects by Subject and ExamDateTime
            var groupedSubjects = subjects
                .GroupBy(s => new { s.Subject, s.ExamDateTime })
                .Select(g => new ExamSubjectTimeDto
                {
                    Subject = g.Key.Subject,
                    ExamDateTime = g.Key.ExamDateTime,
                    TopicOrChapter = g.Select(s => s.TopicOrChapter).ToList()
                })
                .ToList();

            return new ExamScheduleResponse
            {
                Id = schedule.Id,
                Email = schedule.Email,
                DailyStudyHours = schedule.DailyStudyHours,
                ExamDate = schedule.ExamDate,
                CreatedDate = schedule.CreatedDate,
                ExamSubjectTimes = groupedSubjects
            };
        }
    }
}