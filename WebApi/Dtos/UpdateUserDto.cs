using System.ComponentModel.DataAnnotations;

public class UpdateUserDto
{
	[Required]
	public string FullName { get; set; }

	[Required]
	[EmailAddress]
	public string Email { get; set; }

	public string? PhoneNumber { get; set; }
}