using Goodreads.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goodreads.Infrastructure.Persistence.Seeders;

internal class BooksSeeder(ApplicationDbContext dbContext) : ISeeder
{
    public async Task SeedAsync()
    {
        if (await dbContext.Database.CanConnectAsync() &&
            !await dbContext.Books.AnyAsync())
        {
            var books = GetBooks();
            await dbContext.Books.AddRangeAsync(books);
            await dbContext.SaveChangesAsync();
        }
    }

    private IEnumerable<Book> GetBooks()
    {
        return new List<Book>
    {
        // F. Scott Fitzgerald
        new Book { Title = "The Great Gatsby", Description = "A tragic love story set in the Jazz Age.", AuthorId = "1", Language = "English", ISBN = "9780743273565", PublicationDate = new DateOnly(1925, 4, 10), PageCount = 180, Publisher = "Scribner" },
        
        // George Orwell
        new Book { Title = "1984", Description = "A dystopian novel about totalitarianism.", AuthorId = "2", Language = "English", ISBN = "9780451524935", PublicationDate = new DateOnly(1949, 6, 8), PageCount = 328, Publisher = "Signet Classic" },
        new Book { Title = "Animal Farm", Description = "A political allegory about revolution.", AuthorId = "2", Language = "English", ISBN = "9780451526342", PublicationDate = new DateOnly(1945, 8, 17), PageCount = 112, Publisher = "Signet Classic" },
        
        // J.K. Rowling
        new Book { Title = "Harry Potter and the Philosopher's Stone", Description = "First book in Harry Potter series.", AuthorId = "3", Language = "English", ISBN = "9780439708180", PublicationDate = new DateOnly(1997, 6, 26), PageCount = 309, Publisher = "Scholastic" },
        new Book { Title = "Harry Potter and the Chamber of Secrets", Description = "Second book in Harry Potter series.", AuthorId = "3", Language = "English", ISBN = "9780439064873", PublicationDate = new DateOnly(1998, 7, 2), PageCount = 341, Publisher = "Scholastic" },
        
        // J.R.R. Tolkien
        new Book { Title = "The Hobbit", Description = "A fantasy adventure novel.", AuthorId = "4", Language = "English", ISBN = "9780547928227", PublicationDate = new DateOnly(1937, 9, 21), PageCount = 310, Publisher = "Houghton Mifflin" },
        new Book { Title = "The Lord of the Rings", Description = "Epic fantasy trilogy.", AuthorId = "4", Language = "English", ISBN = "9780618640157", PublicationDate = new DateOnly(1954, 7, 29), PageCount = 1178, Publisher = "Houghton Mifflin" },
        
        // Agatha Christie
        new Book { Title = "Murder on the Orient Express", Description = "A classic detective mystery.", AuthorId = "5", Language = "English", ISBN = "9780062693662", PublicationDate = new DateOnly(1934, 1, 1), PageCount = 256, Publisher = "William Morrow" },
        new Book { Title = "And Then There Were None", Description = "A mystery thriller.", AuthorId = "5", Language = "English", ISBN = "9780062073488", PublicationDate = new DateOnly(1939, 11, 6), PageCount = 272, Publisher = "William Morrow" },
        
        // Harper Lee
        new Book { Title = "To Kill a Mockingbird", Description = "A novel about racial injustice.", AuthorId = "6", Language = "English", ISBN = "9780061120084", PublicationDate = new DateOnly(1960, 7, 11), PageCount = 324, Publisher = "Harper Perennial" },
        
        // Stephen King
        new Book { Title = "The Shining", Description = "A horror novel.", AuthorId = "7", Language = "English", ISBN = "9780307743657", PublicationDate = new DateOnly(1977, 1, 28), PageCount = 447, Publisher = "Doubleday" },
        new Book { Title = "It", Description = "A horror novel about a shapeshifting monster.", AuthorId = "7", Language = "English", ISBN = "9781501142970", PublicationDate = new DateOnly(1986, 9, 15), PageCount = 1138, Publisher = "Scribner" },
        
        // Dan Brown
        new Book { Title = "The Da Vinci Code", Description = "A mystery thriller.", AuthorId = "8", Language = "English", ISBN = "9780307474278", PublicationDate = new DateOnly(2003, 3, 18), PageCount = 489, Publisher = "Doubleday" },
        new Book { Title = "Angels & Demons", Description = "A thriller about the Illuminati.", AuthorId = "8", Language = "English", ISBN = "9781416524793", PublicationDate = new DateOnly(2000, 5, 1), PageCount = 616, Publisher = "Pocket Books" },
        
        // Paulo Coelho
        new Book { Title = "The Alchemist", Description = "A philosophical novel about following dreams.", AuthorId = "9", Language = "Portuguese", ISBN = "9780062315007", PublicationDate = new DateOnly(1988, 1, 1), PageCount = 208, Publisher = "HarperOne" },
        
        // Arthur Conan Doyle
        new Book { Title = "The Adventures of Sherlock Holmes", Description = "Collection of detective stories.", AuthorId = "10", Language = "English", ISBN = "9780143105626", PublicationDate = new DateOnly(1892, 10, 14), PageCount = 307, Publisher = "Penguin Classics" },
        new Book { Title = "The Hound of the Baskervilles", Description = "A Sherlock Holmes mystery.", AuthorId = "10", Language = "English", ISBN = "9780141439280", PublicationDate = new DateOnly(1902, 4, 1), PageCount = 256, Publisher = "Penguin Classics" },
        
        // William Shakespeare
        new Book { Title = "Romeo and Juliet", Description = "A tragedy about star-crossed lovers.", AuthorId = "11", Language = "English", ISBN = "9780141396474", PublicationDate = new DateOnly(1597, 1, 1), PageCount = 320, Publisher = "Penguin Classics" },
        new Book { Title = "Hamlet", Description = "A tragedy about revenge.", AuthorId = "11", Language = "English", ISBN = "9780141396504", PublicationDate = new DateOnly(1603, 1, 1), PageCount = 400, Publisher = "Penguin Classics" },
        new Book { Title = "Macbeth", Description = "A tragedy about ambition.", AuthorId = "11", Language = "English", ISBN = "9780141396313", PublicationDate = new DateOnly(1606, 1, 1), PageCount = 272, Publisher = "Penguin Classics" },
        
        // Jane Austen
        new Book { Title = "Pride and Prejudice", Description = "A romantic novel about love and society.", AuthorId = "12", Language = "English", ISBN = "9780141439518", PublicationDate = new DateOnly(1813, 1, 28), PageCount = 432, Publisher = "Penguin Classics" },
        new Book { Title = "Emma", Description = "A comedy of manners.", AuthorId = "12", Language = "English", ISBN = "9780141439587", PublicationDate = new DateOnly(1815, 12, 23), PageCount = 474, Publisher = "Penguin Classics" },
        
        // Mark Twain
        new Book { Title = "Adventures of Huckleberry Finn", Description = "A classic American novel.", AuthorId = "13", Language = "English", ISBN = "9780486280615", PublicationDate = new DateOnly(1884, 12, 10), PageCount = 366, Publisher = "Dover Publications" },
        new Book { Title = "The Adventures of Tom Sawyer", Description = "A classic adventure story.", AuthorId = "13", Language = "English", ISBN = "9780143039563", PublicationDate = new DateOnly(1876, 1, 1), PageCount = 274, Publisher = "Penguin Classics" },
        
        // Ernest Hemingway
        new Book { Title = "The Old Man and the Sea", Description = "A story about struggle and dignity.", AuthorId = "14", Language = "English", ISBN = "9780684801223", PublicationDate = new DateOnly(1952, 9, 1), PageCount = 127, Publisher = "Scribner" },
        new Book { Title = "A Farewell to Arms", Description = "A war love story.", AuthorId = "14", Language = "English", ISBN = "9780684801469", PublicationDate = new DateOnly(1929, 9, 27), PageCount = 355, Publisher = "Scribner" },
        
        // Leo Tolstoy
        new Book { Title = "War and Peace", Description = "Epic historical novel.", AuthorId = "15", Language = "Russian", ISBN = "9780199232765", PublicationDate = new DateOnly(1869, 1, 1), PageCount = 1296, Publisher = "Oxford University Press" },
        new Book { Title = "Anna Karenina", Description = "A tragic love story.", AuthorId = "15", Language = "Russian", ISBN = "9780143035008", PublicationDate = new DateOnly(1877, 1, 1), PageCount = 864, Publisher = "Penguin Classics" },
        
        // Fyodor Dostoevsky
        new Book { Title = "Crime and Punishment", Description = "A psychological thriller.", AuthorId = "16", Language = "Russian", ISBN = "9780143058144", PublicationDate = new DateOnly(1866, 1, 1), PageCount = 671, Publisher = "Penguin Classics" },
        new Book { Title = "The Brothers Karamazov", Description = "A philosophical novel.", AuthorId = "16", Language = "Russian", ISBN = "9780374528379", PublicationDate = new DateOnly(1880, 1, 1), PageCount = 796, Publisher = "Farrar, Straus and Giroux" },
        
        // Gabriel García Márquez
        new Book { Title = "One Hundred Years of Solitude", Description = "Magical realism masterpiece.", AuthorId = "17", Language = "Spanish", ISBN = "9780060883287", PublicationDate = new DateOnly(1967, 6, 5), PageCount = 417, Publisher = "Harper Perennial" },
        
        // Franz Kafka
        new Book { Title = "The Metamorphosis", Description = "A surreal novella.", AuthorId = "18", Language = "German", ISBN = "9780553213690", PublicationDate = new DateOnly(1915, 1, 1), PageCount = 201, Publisher = "Bantam Classics" },
        
        // Haruki Murakami
        new Book { Title = "Norwegian Wood", Description = "A nostalgic love story.", AuthorId = "19", Language = "Japanese", ISBN = "9780375704024", PublicationDate = new DateOnly(1987, 9, 4), PageCount = 296, Publisher = "Vintage" },
        new Book { Title = "Kafka on the Shore", Description = "A surreal adventure.", AuthorId = "19", Language = "Japanese", ISBN = "9781400079278", PublicationDate = new DateOnly(2002, 9, 12), PageCount = 505, Publisher = "Vintage" }
    };
    }
}