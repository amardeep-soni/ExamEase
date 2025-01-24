using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WebApi.Model;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public UserController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<ActionResult<User>> GetCurrentUser()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
                return Unauthorized();

            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<ActionResult<User>> UpdateCurrentUser([FromBody] UpdateUserDto updateDto)
        {
            try
            {
                var email = User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrEmpty(email))
                    return Unauthorized();

                var user = await _userRepository.GetByEmailAsync(email);
                if (user == null)
                    return NotFound();

                var updatedUser = await _userRepository.UpdateAsync(user.Id, updateDto);
                return Ok(updatedUser);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
