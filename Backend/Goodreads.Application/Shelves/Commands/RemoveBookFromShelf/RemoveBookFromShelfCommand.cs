namespace Goodreads.Application.Shelves.Commands.RemoveBookFromShelf;
public record RemoveBookFromShelfCommand(string ShelfId, string BookId) : IRequest<Result>;

