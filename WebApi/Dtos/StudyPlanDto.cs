namespace WebApi.Dtos
{
    public class StudyPlanDto
    {
        public int ExamScheduleId { get; set; }
        public List<StudyPlanRequest> Plans  { get; set; }
    }
    public class StudyPlanRequest
    {
        public string Date { get; set; }
        public List<StudyTasksDto> Tasks { get; set; }
    }
    public class StudyTasksDto
    {
        public string Subject { get; set; }
        public string Topic { get; set; }
        public int TimeAllocated { get; set; } // in minutes
    }
}