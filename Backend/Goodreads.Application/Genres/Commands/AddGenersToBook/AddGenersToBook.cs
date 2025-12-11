using Goodreads.Application.Common.Interfaces.Authorization;

namespace Goodreads.Application.Books.Commands.AddGenersToBook;
public record AddGenersToBookCommand(string BookId, List<string> GenreIds) : IRequest<Result>, IRequireBookAuthorization;