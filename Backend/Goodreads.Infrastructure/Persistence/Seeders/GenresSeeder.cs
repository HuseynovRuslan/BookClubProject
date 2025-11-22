using Goodreads.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goodreads.Infrastructure.Persistence.Seeders;

internal class GenresSeeder(ApplicationDbContext dbContext) : ISeeder
{
    public async Task SeedAsync()
    {
        if (await dbContext.Database.CanConnectAsync() &&
            !await dbContext.Genres.AnyAsync())
        {
            var genres = GetGenres();
            await dbContext.Genres.AddRangeAsync(genres);
            await dbContext.SaveChangesAsync();
        }
    }

    private IEnumerable<Genre> GetGenres()
    {
        return new List<Genre>
        {
            new Genre { Name = "Fiction", BookCount = 0 },
            new Genre { Name = "Non-Fiction", BookCount = 0 },
            new Genre { Name = "Romance", BookCount = 0 },
            new Genre { Name = "Mystery", BookCount = 0 },
            new Genre { Name = "Thriller", BookCount = 0 },
            new Genre { Name = "Science Fiction", BookCount = 0 },
            new Genre { Name = "Fantasy", BookCount = 0 },
            new Genre { Name = "Horror", BookCount = 0 },
            new Genre { Name = "Historical Fiction", BookCount = 0 },
            new Genre { Name = "Literary Fiction", BookCount = 0 },
            new Genre { Name = "Biography", BookCount = 0 },
            new Genre { Name = "Autobiography", BookCount = 0 },
            new Genre { Name = "Memoir", BookCount = 0 },
            new Genre { Name = "Philosophy", BookCount = 0 },
            new Genre { Name = "Poetry", BookCount = 0 },
            new Genre { Name = "Drama", BookCount = 0 },
            new Genre { Name = "Classic", BookCount = 0 },
            new Genre { Name = "Adventure", BookCount = 0 },
            new Genre { Name = "Crime", BookCount = 0 },
            new Genre { Name = "Young Adult", BookCount = 0 }
        };
    }
}

