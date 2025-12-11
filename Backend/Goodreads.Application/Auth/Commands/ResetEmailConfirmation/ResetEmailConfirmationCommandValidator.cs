namespace Goodreads.Application.Auth.Commands.ResetEmailConfirmation;
public class ResetEmailConfirmationCommandValidator : AbstractValidator<ResetEmailConfirmationCommand>
{
    public ResetEmailConfirmationCommandValidator()
    {
        RuleFor(x => x.email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Email is invalid.");
    }
}

