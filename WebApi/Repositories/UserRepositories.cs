using Microsoft.EntityFrameworkCore;
using WebApi.Model;
using WebApi.Services;

namespace WebApi.Repositories
{
    public class UserRepository(ApplicationDbContext _context, IConfiguration _configuration) : IUserRepository
    {
        public async Task<User> CreateAsync(User user)
        {
            user.Id = Guid.NewGuid();
            user.CreatedAt = DateTime.Now;

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByIdAsync(Guid id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<User> UpdateAsync(Guid id, UpdateUserDto updateDto)
        {
            var existingUser = await _context.Users.FindAsync(id);
            if (existingUser == null)
            {
                throw new Exception("User not found");
            }

            // Check if email is being changed and if it's already in use
            if (existingUser.Email != updateDto.Email)
            {
                var emailExists = await _context.Users
                    .AnyAsync(u => u.Email == updateDto.Email && u.Id != id);
                if (emailExists)
                {
                    throw new Exception("Email is already in use");
                }
            }

            existingUser.FullName = updateDto.FullName;
            existingUser.Email = updateDto.Email;
            existingUser.PhoneNumber = updateDto.PhoneNumber;
            existingUser.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return existingUser;
        }

        public async Task DeleteAsync(Guid id)
        {
            var user = await GetByIdAsync(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
        }
    }
}