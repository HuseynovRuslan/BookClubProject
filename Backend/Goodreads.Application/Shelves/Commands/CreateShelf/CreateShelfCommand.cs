using Goodreads.Application.DTOs;

namespace Goodreads.Application.Shelves.Commands.CreateShelf;
public record CreateShelfCommand(string Name) : IRequest<Result<ShelfDto>>;

