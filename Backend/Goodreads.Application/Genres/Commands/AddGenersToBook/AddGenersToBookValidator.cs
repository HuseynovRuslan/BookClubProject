using Goodreads.Application.Books.Commands.AddGenersToBook;

public class AddGenersToBookCommandValidator : AbstractValidator<AddGenersToBookCommand>
{
    public AddGenersToBookCommandValidator()
    {
        RuleFor(x => x.BookId)
            .NotEmpty();

        RuleFor(x => x.GenreIds)
            .NotNull()
            .Must(g => g.Count > 0).WithMessage("At least one genre must be specified.");
    }
}