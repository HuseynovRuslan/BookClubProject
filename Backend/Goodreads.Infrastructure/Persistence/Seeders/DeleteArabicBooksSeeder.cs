using Goodreads.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goodreads.Infrastructure.Persistence.Seeders;

/// <summary>
/// Ərəb dilində olan kitabları database-dən silir
/// </summary>
internal class DeleteArabicBooksSeeder(ApplicationDbContext dbContext) : ISeeder
{
    public async Task SeedAsync()
    {
        if (await dbContext.Database.CanConnectAsync())
        {
            // Ərəb dilində olan kitabları tap
            var arabicBooks = await dbContext.Books
                .Where(b => b.Language == "Arabic" || 
                           b.Language.Contains("Arabic", StringComparison.OrdinalIgnoreCase) ||
                           b.Language.Contains("عربي", StringComparison.OrdinalIgnoreCase))
                .ToListAsync();

            if (arabicBooks.Any())
            {
                // Əlaqəli məlumatları sil (BookGenres, BookShelves, BookReviews)
                var bookIds = arabicBooks.Select(b => b.Id).ToList();

                // BookGenres sil
                var bookGenres = await dbContext.BookGenres
                    .Where(bg => bookIds.Contains(bg.BookId))
                    .ToListAsync();
                if (bookGenres.Any())
                {
                    dbContext.BookGenres.RemoveRange(bookGenres);
                }

                // BookShelves sil
                var bookShelves = await dbContext.BookShelves
                    .Where(bs => bookIds.Contains(bs.BookId))
                    .ToListAsync();
                if (bookShelves.Any())
                {
                    dbContext.BookShelves.RemoveRange(bookShelves);
                }

                // BookReviews sil
                var bookReviews = await dbContext.BookReviews
                    .Where(br => bookIds.Contains(br.BookId))
                    .ToListAsync();
                if (bookReviews.Any())
                {
                    dbContext.BookReviews.RemoveRange(bookReviews);
                }

                // Kitabları sil
                dbContext.Books.RemoveRange(arabicBooks);
                await dbContext.SaveChangesAsync();
            }
        }
    }
}

