namespace WebApi.Model
{
    public class ExamSubjectTime
    {
        public int Id { get; set; }
        public int ExamScheduleId { get; set; }
        public string Subject { get; set; }
        public string TopicOrChapter { get; set; }
        public DateTime ExamDateTime { get; set; }
    }
}
