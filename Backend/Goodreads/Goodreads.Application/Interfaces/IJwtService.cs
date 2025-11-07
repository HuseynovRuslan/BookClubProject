using Goodreads.Domain.Entities;

namespace Goodreads.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
}
