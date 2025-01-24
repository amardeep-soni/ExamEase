namespace WebApi.Dtos
{
    public class ExamScheduleRequest
    {
        public string Email { get; set; }
        public int DailyStudyHours { get; set; }
        public DateTime ExamDate { get; set; }
        public List<ExamSubjectTimeDto> ExamSubjectTimes { get; set; }
    }

    public class ExamSubjectTimeDto
    {
        public string Subject { get; set; }
        public List<string> TopicOrChapter { get; set; }
        public DateTime ExamDateTime { get; set; }
    }
}
