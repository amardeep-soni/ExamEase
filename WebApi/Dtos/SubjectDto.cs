using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

public class SubjectDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public List<string> FileNames { get; set; } // Array of file names
    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
}

public class subjectRequest
{
    [Required]
    public string Name { get; set; }
    public string Description { get; set; }
    public List<string> FileNames { get; set; }
}