// Bu using-ləri mütləq əlavə et:
using Goodreads.Domain.Entities;

namespace Goodreads.Application.Common.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<Author> Authors { get; }
        IRepository<Genre> Genres { get; }
        IRepository<Book> Books { get; }
        IRepository<Shelf> Shelves { get; }
        IRepository<BookShelf> BookShelves { get; }
        IRepository<BookReview> BookReviews { get; }

        Task<int> SaveChangesAsync();
    }
}