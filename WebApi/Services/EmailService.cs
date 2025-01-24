using System.Net.Mail;
using System.Net;

namespace WebApi.Services
{
    public class EmailService: IEmailService
    {
        private readonly string _email;
        private readonly string _password;
        private readonly string _host;
        private readonly int _port;

        public EmailService(IConfiguration configuration)
        {
            _email = configuration["EmailSettings:Email"]
                ?? throw new ArgumentNullException(nameof(configuration), "Email is not configured");
            _password = configuration["EmailSettings:Password"]
                ?? throw new ArgumentNullException(nameof(configuration), "Password is not configured");
            _host = configuration["EmailSettings:Host"] ?? "smtp.gmail.com";
            _port = int.Parse(configuration["EmailSettings:Port"] ?? "587");
        }

        public async Task SendEmailAsync(string to, string subject, string htmlBody)
        {
            try
            {
                var message = new MailMessage
                {
                    From = new MailAddress(_email),
                    Subject = subject,
                    Body = WrapInTemplate(htmlBody),
                    IsBodyHtml = true
                };
                message.To.Add(to);

                using var smtpClient = new SmtpClient(_host, _port)
                {
                    EnableSsl = true,
                    Credentials = new NetworkCredential(_email, _password)
                };

                await smtpClient.SendMailAsync(message);
            }
            catch (Exception ex)
            {
                // Log the error but don't expose email server details to the client
                throw new Exception("Failed to send email. Please try again later.");
            }
        }

        public async Task SendWelcomeEmailAsync(string to, string name)
        {
            string htmlBody = GetEmailTemplate("Welcome")
                .Replace("{{name}}", name)
                .Replace("{{year}}", DateTime.Now.Year.ToString());

            await SendEmailAsync(to, "Welcome to Exam Ease!", htmlBody);
        }

        public async Task SendOtpEmailAsync(string to, string otp, string purpose)
        {
            string htmlBody = GetEmailTemplate("OTP")
                .Replace("{{otp}}", otp)
                .Replace("{{purpose}}", purpose);

            await SendEmailAsync(to, $"Your OTP for {purpose}", htmlBody);
        }

        private string WrapInTemplate(string content)
        {
            return $@"
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset='UTF-8'>
				<meta name='viewport' content='width=device-width, initial-scale=1.0'>
				<style>
					body {{ 
						font-family: Arial, sans-serif;
						line-height: 1.6;
						color: #333;
						margin: 0;
						padding: 0;
					}}
					.container {{
						max-width: 600px;
						margin: 0 auto;
						padding: 20px;
					}}
					.header {{
						background-color: #4CAF50;
						color: white;
						padding: 20px;
						text-align: center;
					}}
					.footer {{
						background-color: #f4f4f4;
						padding: 20px;
						text-align: center;
						font-size: 12px;
						color: #666;
					}}
				</style>
			</head>
			<body>
				<div class='container'>
					<div class='header'>
						<h1>Exam Ease</h1>
					</div>
					{content}
					<div class='footer'>
						<p>&copy; {DateTime.Now.Year} Exam Ease. All rights reserved.</p>
						<p>This is an automated message, please do not reply to this email.</p>
					</div>
				</div>
			</body>
			</html>";
        }

        private string GetEmailTemplate(string templateName)
        {
            switch (templateName)
            {
                case "Welcome":
                    return @"
					<div style='padding: 20px;'>
						<h2>Welcome {{name}}! 🎉</h2>
						<p>We're excited to have you join to Exam Ease.</p>
						<p>Here's what you can do next:</p>
						<ul>
							<li>Complete your profile</li>
							<li>Explore our features</li>
							<li>Connect with others</li>
						</ul>
						<p>If you have any questions, feel free to reach out to our support team.</p>
						<p>Best regards,<br>The Team</p>
					</div>";

                case "OTP":
                    return @"
					<div style='padding: 20px;'>
						<h2>Your Verification Code</h2>
						<p>You requested an OTP for {{purpose}}.</p>
						<div style='background: #f5f5f5; padding: 15px; text-align: center; margin: 20px 0;'>
							<span style='font-size: 24px; letter-spacing: 5px; font-weight: bold;'>{{otp}}</span>
						</div>
						<p>This code will expire in 10 minutes.</p>
						<p style='color: #666; font-size: 14px;'>
							If you didn't request this code, please ignore this email or contact support if you're concerned.
						</p>
					</div>";

                default:
                    return string.Empty;
            }
        }
    }
}
