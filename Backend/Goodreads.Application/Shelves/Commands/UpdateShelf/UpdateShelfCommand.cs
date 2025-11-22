namespace Goodreads.Application.Shelves.Commands.UpdateShelf;
public record UpdateShelfCommand(string ShelfId, string Name) : IRequest<Result>;

