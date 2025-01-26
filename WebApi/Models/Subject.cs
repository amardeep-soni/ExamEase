public class Subject
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string FileNames { get; set; } // Comma-separated file names
    public string Email { get; set; } // To associate with user
    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
} 