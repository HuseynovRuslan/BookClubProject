using FluentValidation;

namespace Goodreads.Application.Users.Commands.AdminUpdateUser;

public class AdminUpdateUserCommandValidator : AbstractValidator<AdminUpdateUserCommand>
{
    public AdminUpdateUserCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");

        RuleFor(x => x.Email)
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.Email))
            .WithMessage("Invalid email format.");

        RuleFor(x => x.FirstName)
            .MaximumLength(50).WithMessage("First name must not exceed 50 characters.");

        RuleFor(x => x.LastName)
            .MaximumLength(50).WithMessage("Last name must not exceed 50 characters.");
            
        RuleFor(x => x.UserName)
            .MaximumLength(50).When(x => !string.IsNullOrEmpty(x.UserName))
            .Matches("^[a-zA-Z0-9._-]+$").When(x => !string.IsNullOrEmpty(x.UserName))
            .WithMessage("Username can only contain letters, numbers, periods, underscores, and hyphens.");
    }
}
