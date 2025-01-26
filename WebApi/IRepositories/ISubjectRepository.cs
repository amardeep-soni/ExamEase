namespace WebApi.IRepositories
{
    public interface ISubjectRepository
    {
        Task<Subject> GetByIdAsync(int id, string userEmail);
        Task<List<Subject>> GetAllAsync(string userEmail);
        Task<Subject> CreateAsync(subjectRequest dto, string userEmail);
        Task<Subject> UpdateAsync(int id, subjectRequest dto, string userEmail);
        Task DeleteAsync(int id, string userEmail);
    }
}