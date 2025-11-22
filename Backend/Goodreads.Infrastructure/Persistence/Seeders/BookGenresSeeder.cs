using Goodreads.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goodreads.Infrastructure.Persistence.Seeders;

internal class BookGenresSeeder(ApplicationDbContext dbContext) : ISeeder
{
    public async Task SeedAsync()
    {
        if (await dbContext.Database.CanConnectAsync() &&
            await dbContext.Books.AnyAsync() &&
            await dbContext.Genres.AnyAsync() &&
            !await dbContext.BookGenres.AnyAsync())
        {
            var books = await dbContext.Books.ToListAsync();
            var genres = await dbContext.Genres.ToListAsync();

            var bookGenres = new List<BookGenre>();

            foreach (var book in books)
            {
                // Hər kitab üçün uyğun genre-ləri tapmaq
                var bookGenresForBook = GetGenresForBook(book, genres);
                bookGenres.AddRange(bookGenresForBook);
            }

            await dbContext.BookGenres.AddRangeAsync(bookGenres);
            await dbContext.SaveChangesAsync();
        }
    }

    private List<BookGenre> GetGenresForBook(Book book, List<Genre> allGenres)
    {
        var bookGenres = new List<BookGenre>();

        // Kitabın adına və təsvirinə görə genre-ləri təyin etmək
        var title = book.Title.ToLower();
        var description = book.Description?.ToLower() ?? "";

        // Fiction
        if (title.Contains("novel") || title.Contains("story") || 
            description.Contains("novel") || description.Contains("story"))
        {
            var fiction = allGenres.FirstOrDefault(g => g.Name == "Fiction");
            if (fiction != null)
                bookGenres.Add(new BookGenre { BookId = book.Id, GenreId = fiction.Id });
        }

        // Classic
        if (book.PublicationDate.Year < 1950)
        {
            var classic = allGenres.FirstOrDefault(g => g.Name == "Classic");
            if (classic != null && !bookGenres.Any(bg => bg.GenreId == classic.Id))
                bookGenres.Add(new BookGenre { BookId = book.Id, GenreId = classic.Id });
        }

        // Literary Fiction
        if (title.Contains("farewell") || title.Contains("arms") || 
            title.Contains("gatsby") || title.Contains("mockingbird") ||
            title.Contains("karenina") || title.Contains("peace"))
        {
            var literary = allGenres.FirstOrDefault(g => g.Name == "Literary Fiction");
            if (literary != null && !bookGenres.Any(bg => bg.GenreId == literary.Id))
                bookGenres.Add(new BookGenre { BookId = book.Id, GenreId = literary.Id });
        }

        // Romance
        if (title.Contains("romeo") || title.Contains("juliet") || 
            title.Contains("pride") || title.Contains("prejudice") ||
            title.Contains("sense") || title.Contains("sensibility"))
        {
            var romance = allGenres.FirstOrDefault(g => g.Name == "Romance");
            if (romance != null && !bookGenres.Any(bg => bg.GenreId == romance.Id))
                bookGenres.Add(new BookGenre { BookId = book.Id, GenreId = romance.Id });
        }

        // Horror
        if (title.Contains("shining") || title.Contains("it") || 
            description.Contains("horror"))
        {
            var horror = allGenres.FirstOrDefault(g => g.Name == "Horror");
            if (horror != null && !bookGenres.Any(bg => bg.GenreId == horror.Id))
                bookGenres.Add(new BookGenre { BookId = book.Id, GenreId = horror.Id });
        }

        // Mystery
        if (title.Contains("murder") || title.Contains("sherlock") || 
            title.Contains("orient") || title.Contains("express"))
        {
            var mystery = allGenres.FirstOrDefault(g => g.Name == "Mystery");
            if (mystery != null && !bookGenres.Any(bg => bg.GenreId == mystery.Id))
                bookGenres.Add(new BookGenre { BookId = book.Id, GenreId = mystery.Id });
        }

        // Fantasy
        if (title.Contains("hobbit") || title.Contains("rings") || 
            title.Contains("potter") || title.Contains("alchemist"))
        {
            var fantasy = allGenres.FirstOrDefault(g => g.Name == "Fantasy");
            if (fantasy != null && !bookGenres.Any(bg => bg.GenreId == fantasy.Id))
                bookGenres.Add(new BookGenre { BookId = book.Id, GenreId = fantasy.Id });
        }

        // Thriller
        if (title.Contains("da vinci") || title.Contains("angels") || 
            title.Contains("demons") || description.Contains("thriller"))
        {
            var thriller = allGenres.FirstOrDefault(g => g.Name == "Thriller");
            if (thriller != null && !bookGenres.Any(bg => bg.GenreId == thriller.Id))
                bookGenres.Add(new BookGenre { BookId = book.Id, GenreId = thriller.Id });
        }

        // Historical Fiction
        if (title.Contains("war") || title.Contains("peace") || 
            title.Contains("karenina") || description.Contains("historical"))
        {
            var historical = allGenres.FirstOrDefault(g => g.Name == "Historical Fiction");
            if (historical != null && !bookGenres.Any(bg => bg.GenreId == historical.Id))
                bookGenres.Add(new BookGenre { BookId = book.Id, GenreId = historical.Id });
        }

        // Drama
        if (title.Contains("hamlet") || title.Contains("macbeth") || 
            title.Contains("romeo") || title.Contains("juliet"))
        {
            var drama = allGenres.FirstOrDefault(g => g.Name == "Drama");
            if (drama != null && !bookGenres.Any(bg => bg.GenreId == drama.Id))
                bookGenres.Add(new BookGenre { BookId = book.Id, GenreId = drama.Id });
        }

        // Əgər heç bir genre tapılmadısa, default olaraq Fiction əlavə et
        if (!bookGenres.Any())
        {
            var fiction = allGenres.FirstOrDefault(g => g.Name == "Fiction");
            if (fiction != null)
                bookGenres.Add(new BookGenre { BookId = book.Id, GenreId = fiction.Id });
        }

        return bookGenres;
    }
}

