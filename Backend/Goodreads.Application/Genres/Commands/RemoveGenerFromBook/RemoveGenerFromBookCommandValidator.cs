using Goodreads.Application.Books.Commands.RemoveGenrerFromBook;

namespace Goodreads.Application.Books.Commands.RemoveGenerFromBook;
public class RemoveGenerFromBookCommandValidator : AbstractValidator<RemoveGenerFromBookCommand>
{
    public RemoveGenerFromBookCommandValidator()
    {
        RuleFor(x => x.BookId).NotEmpty();

        RuleFor(x => x.GenreId).NotEmpty();
    }
}