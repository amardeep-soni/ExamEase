using System.ComponentModel.DataAnnotations;

public class VerifyOtpDto
{
	[Required]
	[EmailAddress]
	public string Email { get; set; }

	[Required]
	public string Otp { get; set; }
}