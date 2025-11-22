namespace Goodreads.Application.Shelves.Commands.DeleteShelf;
public record DeleteShelfCommand(string ShelfId) : IRequest<Result>;

