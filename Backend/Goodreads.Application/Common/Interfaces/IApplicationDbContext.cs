using Goodreads.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public interface IApplicationDbContext
{
    DbSet<Information> Informations { get; }
    DbSet<FeedBack> FeedBacks { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
