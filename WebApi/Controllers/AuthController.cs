using Microsoft.AspNetCore.Mvc;
using WebApi.Dtos;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _userService;

        public AuthController(IAuthRepository userService)
        {
            _userService = userService;
        }

        [HttpGet("status")]
        public string GetStatus()
        {
            return "ExamEase API is Live and Running! Deployment successful.";
        }


        [HttpPost("register")]
        public async Task<ResponseMessage> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                var user = await _userService.RegisterAsync(registerDto, HttpContext);
                return new ResponseMessage { IsError = "false", Message = "User Registered Successfully." };
            }
            catch (Exception ex)
            {
                return new ResponseMessage { IsError = "true", Message = ex.Message };
            }
        }

        [HttpPost("login")]
        public async Task<ResponseMessage> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                var token = await _userService.LoginAsync(loginDto);
                return new ResponseMessage { IsError = "false", Message = token };
            }
            catch (Exception ex)
            {
                return new ResponseMessage { IsError = "true", Message = ex.Message };
            }
        }

        [HttpPost("forgot-password")]
        public async Task<ResponseMessage> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            try
            {
                await _userService.ForgotPasswordAsync(forgotPasswordDto.Email);
                return new ResponseMessage { IsError = "false", Message = "OTP Send Successfully." };
            }
            catch (Exception ex)
            {
                return new ResponseMessage { IsError = "true", Message = ex.Message };
            }
        }

        [HttpPost("reset-password")]
        public async Task<ResponseMessage> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            try
            {
                await _userService.ResetPasswordAsync(resetPasswordDto);
                return new ResponseMessage { IsError = "false", Message = "Password has been reset successfully." };
            }
            catch (Exception ex)
            {
                return new ResponseMessage { IsError = "true", Message = ex.Message };
            }
        }

        [HttpPost("verify-otp")]
        public async Task<ResponseMessage> VerifyOtp([FromBody] VerifyOtpDto verifyOtpDto)
        {
            try
            {
                var result = await _userService.VerifyOtpAsync(verifyOtpDto);
                return new ResponseMessage { IsError = "false", Message = result.ToString() };
            }
            catch (Exception ex)
            {
                return new ResponseMessage { IsError = "true", Message = ex.Message };
            }
        }

        [HttpPost("resend-otp")]
        public async Task<ResponseMessage> ResendOtp([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            try
            {
                var result = await _userService.ResendOtpAsync(forgotPasswordDto.Email);
                return new ResponseMessage { IsError = "false", Message = "OTP resent successfully." };
            }
            catch (Exception ex)
            {
                return new ResponseMessage { IsError = "true", Message = ex.Message };
            }
        }

        [HttpPost("validate-token")]
        public async Task<ResponseMessage> ValidateToken([FromBody] ValidateTokenDto validateTokenDto)
        {
            try
            {
                var result = await _userService.ValidateTokenAsync(validateTokenDto.Token);
                return new ResponseMessage { IsError = "false", Message = result.ToString() };
            }
            catch (Exception ex)
            {
                return new ResponseMessage { IsError = "true", Message = ex.Message };
            }
        }
    }
}
