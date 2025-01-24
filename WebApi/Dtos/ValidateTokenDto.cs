using System.ComponentModel.DataAnnotations;

public class ValidateTokenDto
{
    [Required]
    public string Token { get; set; }
} 