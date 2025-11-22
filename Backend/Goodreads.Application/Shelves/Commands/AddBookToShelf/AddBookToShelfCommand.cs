namespace Goodreads.Application.Shelves.Commands.AddBookToShelf;
public record AddBookToShelfCommand(string ShelfId, string BookId) : IRequest<Result>;

