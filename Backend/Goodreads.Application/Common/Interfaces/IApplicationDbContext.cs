using Goodreads.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public interface IApplicationDbContext
{
    DbSet<Information> Informations { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
