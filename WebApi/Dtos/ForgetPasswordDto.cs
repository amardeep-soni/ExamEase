using System.ComponentModel.DataAnnotations;

public class ForgotPasswordDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; }
} 