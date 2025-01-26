namespace WebApi.Dtos
{
    public class ExamScheduleResponse
    {
        public int Id { get; set; }
        public string ExamName { get; set; }
        public string Email { get; set; }
        public int DailyStudyHours { get; set; }
        public DateTime ExamDate { get; set; }
        public DateTime CreatedDate { get; set; }
        public List<ExamSubjectTimeDto> ExamSubjectTimes { get; set; }
    }
} 