namespace WebApi.Model
{
    public class StudyPlan
    {
        public int Id { get; set; }
        public int ExamScheduleId { get; set; }
        public string Plans { get; set; } // it includes array of object subject, topic, timeAllocated and date
    }
}
