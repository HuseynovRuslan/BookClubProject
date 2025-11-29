namespace Goodreads.Application.Books.Commands.AddGenersToBook;
public record AddGenersToBookCommand(string BookId, List<string> GenreIds) : IRequest<Result<string>>;