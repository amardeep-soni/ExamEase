using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace WebApi.Services
{
    public interface IUserContextService
    {
        string GetUserEmail();
    }

    public class UserContextService : IUserContextService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserContextService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string GetUserEmail()
        {
            var email = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
            {
                throw new UnauthorizedAccessException("User email not found in claims");
            }
            return email;
        }
    }
} 