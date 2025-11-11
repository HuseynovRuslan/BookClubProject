using Goodreads.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goodreads.Infrastructure.Persistence.Seeders;

internal class AuthorsSeeder(ApplicationDbContext dbContext) : ISeeder
{

    public async Task SeedAsync()
    {
        if (await dbContext.Database.CanConnectAsync() &&
            !await dbContext.Authors.AnyAsync())
        {
            var authors = GetAuthors();
            await dbContext.Authors.AddRangeAsync(authors);
            await dbContext.SaveChangesAsync();
        }
    }


    private IEnumerable<Author> GetAuthors()
    {
        var authors = new List<Author>
    {
        new Author { Id = "1", Name = "F. Scott Fitzgerald", Bio = "American novelist and short story writer, known for depicting the Jazz Age." },
        new Author { Id = "2", Name = "George Orwell", Bio = "English novelist and essayist, famous for dystopian works." },
        new Author { Id = "3", Name = "J.K. Rowling", Bio = "British author, creator of the Harry Potter series." },
        new Author { Id = "4", Name = "J.R.R. Tolkien", Bio = "English writer and philologist, author of The Lord of the Rings." },
        new Author { Id = "5", Name = "Agatha Christie", Bio = "English writer known as the 'Queen of Mystery'." },
        new Author { Id = "6", Name = "Harper Lee", Bio = "American novelist, best known for To Kill a Mockingbird." },
        new Author { Id = "7", Name = "Stephen King", Bio = "American author of horror, supernatural fiction, and suspense." },
        new Author { Id = "8", Name = "Dan Brown", Bio = "American author known for thriller novels." },
        new Author { Id = "9", Name = "Paulo Coelho", Bio = "Brazilian lyricist and novelist, author of The Alchemist." },
        new Author { Id = "10", Name = "Arthur Conan Doyle", Bio = "British writer, creator of Sherlock Holmes." },
        new Author { Id = "11", Name = "William Shakespeare", Bio = "English playwright, poet, and actor, regarded as the greatest writer." },
        new Author { Id = "12", Name = "Jane Austen", Bio = "English novelist known for romantic fiction and social commentary." },
        new Author { Id = "13", Name = "Mark Twain", Bio = "American writer, humorist, and lecturer." },
        new Author { Id = "14", Name = "Ernest Hemingway", Bio = "American novelist and short story writer, Nobel Prize winner." },
        new Author { Id = "15", Name = "Leo Tolstoy", Bio = "Russian author, known for War and Peace and Anna Karenina." },
        new Author { Id = "16", Name = "Fyodor Dostoevsky", Bio = "Russian novelist, philosopher, known for psychological depth." },
        new Author { Id = "17", Name = "Gabriel García Márquez", Bio = "Colombian novelist, Nobel laureate, master of magical realism." },
        new Author { Id = "18", Name = "Franz Kafka", Bio = "German-speaking Bohemian writer of novels and short stories." },
        new Author { Id = "19", Name = "Haruki Murakami", Bio = "Contemporary Japanese novelist and translator." }
    };
        return authors;
    }


}