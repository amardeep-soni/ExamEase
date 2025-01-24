namespace WebApi.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string htmlBody);
        Task SendWelcomeEmailAsync(string to, string name);
        Task SendOtpEmailAsync(string to, string otp, string purpose);
    }
}
