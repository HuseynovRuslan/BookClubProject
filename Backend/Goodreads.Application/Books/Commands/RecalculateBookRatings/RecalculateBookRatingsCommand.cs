namespace Goodreads.Application.Books.Commands.RecalculateBookRatings;
public record RecalculateBookRatingsCommand() : IRequest<Result<int>>;
