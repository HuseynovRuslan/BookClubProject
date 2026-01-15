using Goodreads.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goodreads.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Information> Informations { get; }
    DbSet<FeedBack> FeedBacks { get; }
    DbSet<BookShelf> BookShelves { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
