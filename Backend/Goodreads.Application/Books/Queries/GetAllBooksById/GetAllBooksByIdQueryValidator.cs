using FluentValidation;

namespace Goodreads.Application.Books.Queries.GetBookById
{
    public class GetBookByIdQueryValidator : AbstractValidator<GetBookByIdQuery>
    {
        public GetBookByIdQueryValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty()
                .WithMessage("Book ID is required.");

            RuleFor(x => x.Id)
                .MaximumLength(100)
                .WithMessage("Book ID length cannot exceed 100 characters.");
        }
    }
}
