using Microsoft.EntityFrameworkCore;
using WebApi.IRepositories;
using WebApi.Services;



public class SubjectRepository : ISubjectRepository
{
    private readonly ApplicationDbContext _context;
    private readonly AIService _aiService;

    public SubjectRepository(
        ApplicationDbContext context,
        AIService aIService)
    {
        _context = context;
        _aiService = aIService;
    }

    public async Task<Subject> GetByIdAsync(int id, string userEmail)
    {
        return await _context.Subjects
            .FirstOrDefaultAsync(s => s.Id == id && s.Email == userEmail);
    }

    public async Task<List<Subject>> GetAllAsync(string userEmail)
    {
        return await _context.Subjects
            .Where(s => s.Email == userEmail)
            .OrderByDescending(s => s.CreatedDate)
            .ToListAsync();
    }

    public async Task<Subject> CreateAsync(subjectRequest request, string userEmail)
    {

        var subject = new Subject
        {
            Name = request.Name,
            Description = request.Description,
            FileNames = string.Join(",", request.FileNames),
            Email = userEmail,
            CreatedDate = DateTime.UtcNow
        };

        _context.Subjects.Add(subject);
        await _context.SaveChangesAsync();
        return subject;
    }

    public async Task<Subject> UpdateAsync(int id, subjectRequest request, string userEmail)
    {
        var subject = await GetByIdAsync(id, userEmail);
        if (subject == null) return null;

        subject.Name = request.Name;
        subject.Description = request.Description;

        var existingFiles = subject.FileNames?
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .ToList() ?? new List<string>();

        existingFiles.AddRange(request.FileNames);
        subject.FileNames = string.Join(",", existingFiles.Distinct());
       

        subject.UpdatedDate = DateTime.UtcNow;

        _context.Subjects.Update(subject);
        await _context.SaveChangesAsync();
        return subject;
    }

    public async Task DeleteAsync(int id, string userEmail)
    {
        var subject = await GetByIdAsync(id, userEmail);
        var fileNames = subject?.FileNames?.Split(',', StringSplitOptions.RemoveEmptyEntries);
        if (fileNames.Any() == true)
        {
            foreach (var fileName in fileNames)
            {
                await _aiService.DeleteDataFromMemory(fileName);
            }
        }
        if (subject != null)
        {
            _context.Subjects.Remove(subject);
            await _context.SaveChangesAsync();
        }
    }
}
