using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WebApi.Services;
using WebApi.Model;
using Microsoft.EntityFrameworkCore;

namespace WebApi.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthRepository(
            ApplicationDbContext context,
            IConfiguration configuration,
            IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
        }

        public async Task<User> RegisterAsync(RegisterDto registerDto, HttpContext httpContext)
        {
            // Check if email exists
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                throw new Exception("Email is already registered");
            }

            // Create user
            var user = new User
            {
                Id = Guid.NewGuid(),
                FullName = registerDto.FullName,
                Email = registerDto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                PhoneNumber = registerDto.PhoneNumber,
                CreatedAt = DateTime.Now,
                IsEmailVerified = false
            };

            // Generate email verification token
            user.EmailVerificationToken = GenerateOtp();
            user.EmailVerificationTokenExpiry = DateTime.Now.AddMinutes(10);

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            // Send welcome email with verification OTP
            await _emailService.SendWelcomeEmailAsync(user.Email, user.FullName);
            await _emailService.SendOtpEmailAsync(user.Email, user.EmailVerificationToken, "Email Verification");

            return user;
        }

        public async Task<string> LoginAsync(LoginDto loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
            {
                throw new Exception("Invalid email or password");
            }

            if (!user.IsEmailVerified)
            {
                throw new Exception("Please verify your email first");
            }

            // Update last login
            user.LastLoginAt = DateTime.Now;
            await _context.SaveChangesAsync();

            // Generate and return JWT token
            return GenerateJwtToken(user);
        }

        public async Task<bool> ForgotPasswordAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                // Return true even if user doesn't exist for security
                return true;
            }

            // Generate password reset token (OTP)
            user.PasswordResetToken = GenerateOtp();
            user.PasswordResetTokenExpiry = DateTime.Now.AddMinutes(10);

            await _context.SaveChangesAsync();

            // Send password reset email
            await _emailService.SendOtpEmailAsync(user.Email, user.PasswordResetToken, "Password Reset");

            return true;
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Email == resetPasswordDto.Email &&
                u.PasswordResetToken == resetPasswordDto.Code &&
                u.PasswordResetTokenExpiry > DateTime.Now);

            if (user == null)
            {
                throw new Exception("Invalid or expired reset token");
            }

            // Update password
            user.Password = BCrypt.Net.BCrypt.HashPassword(resetPasswordDto.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;
            user.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> VerifyOtpAsync(VerifyOtpDto verifyOtpDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == verifyOtpDto.Email);

            if (user == null)
            {
                throw new Exception("User not found");
            }

            // Check if this is for email verification
            if (!user.IsEmailVerified &&
                user.EmailVerificationToken == verifyOtpDto.Otp &&
                user.EmailVerificationTokenExpiry > DateTime.Now)
            {
                user.IsEmailVerified = true;
                user.EmailVerificationToken = null;
                user.EmailVerificationTokenExpiry = null;
                await _context.SaveChangesAsync();
                return true;
            }

            // Check if this is for password reset
            if (user.PasswordResetToken == verifyOtpDto.Otp &&
                user.PasswordResetTokenExpiry > DateTime.Now)
            {
                return true;
            }

            throw new Exception("Invalid or expired OTP");
        }
        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string GenerateOtp()
        {
            // Generate 6-digit OTP
            Random random = new Random();
            return random.Next(100000, 999999).ToString();
        }

        public async Task<bool> ResendOtpAsync(string email)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
                throw new Exception("User not found");

            // Generate new OTP
            string otp = GenerateOTP();
            user.PasswordResetToken = otp;
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(5);

            await _context.SaveChangesAsync();

            // Send email
            try
            {
                await _emailService.SendEmailAsync(
                    email,
                    "New OTP Code",
                    $"Your new OTP is: {otp}. This code will expire in 5 minutes."
                );
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to send new OTP email");
            }
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);

                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        private string GenerateOTP()
        {
            // Generate 6-digit OTP
            Random random = new Random();
            return random.Next(100000, 999999).ToString();
        }
    }
}
