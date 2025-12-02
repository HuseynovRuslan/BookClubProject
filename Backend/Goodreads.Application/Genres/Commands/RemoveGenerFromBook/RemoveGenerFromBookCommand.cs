namespace Goodreads.Application.Books.Commands.RemoveGenrerFromBook;
public record RemoveGenerFromBookCommand(string BookId, string GenreId) : IRequest<Result>;