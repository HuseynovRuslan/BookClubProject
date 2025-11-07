using Goodreads.Domain.Entities;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
}
