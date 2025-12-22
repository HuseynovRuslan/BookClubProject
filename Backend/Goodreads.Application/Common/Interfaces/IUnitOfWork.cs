using Goodreads.Domain.Entities;

namespace Goodreads.Application.Common.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<Author> Authors { get; }
        IRepository<User> Users { get; }
        IRepository<Genre> Genres { get; }
        IRepository<Book> Books { get; }
        IRepository<Information> Informations { get; } 
        IRepository<Shelf> Shelves { get; }
        IRepository<BookShelf> BookShelves { get; }
        IRepository<BookReview> BookReviews { get; }
        IRepository<Quote> Quotes { get; }
        IRepository<QuoteLike> QuoteLikes { get; }
        IRepository<ReadingProgress> ReadingProgresses { get; }
        IRepository<UserYearChallenge> UserYearChallenges { get; }

        Task<int> SaveChangesAsync();
    }
}