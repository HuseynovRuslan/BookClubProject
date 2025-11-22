using Microsoft.AspNetCore.Http;

namespace Goodreads.Application.Users.Commands.UpdateProfilePicture;
public class UpdateProfilePictureCommandValidator : AbstractValidator<UpdateProfilePictureCommand>
{
    private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif" };
    private const long _maxFileSize = 5 * 1024 * 1024; // 5MB

    public UpdateProfilePictureCommandValidator()
    {
        RuleFor(x => x.File)
            .NotNull().WithMessage("File is required.");

        RuleFor(x => x.File)
            .Must(file => file != null && _allowedExtensions.Contains(Path.GetExtension(file.FileName).ToLowerInvariant()))
            .WithMessage($"File extension must be one of: {string.Join(", ", _allowedExtensions)}");

        RuleFor(x => x.File)
            .Must(file => file == null || file.Length <= _maxFileSize)
            .WithMessage($"File size must not exceed {_maxFileSize / (1024 * 1024)} MB.");
    }
}

