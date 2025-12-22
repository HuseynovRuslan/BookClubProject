using FluentValidation;

namespace Goodreads.Application.News.Commands.CreateNews;

public class CreateInformationCommandValidator : AbstractValidator<CreateInformationCommand>
{
    public CreateInformationCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MinimumLength(3).WithMessage("Title must be at least 3 characters.")
            .MaximumLength(150).WithMessage("Title must not exceed 150 characters.");

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Content is required.")
            .MinimumLength(10).WithMessage("Content must be at least 10 characters.");

        RuleFor(x => x.Details)
            .NotEmpty().WithMessage("Details is required.")
            .MinimumLength(10).WithMessage("Details must be at least 10 characters.");
    }
}
