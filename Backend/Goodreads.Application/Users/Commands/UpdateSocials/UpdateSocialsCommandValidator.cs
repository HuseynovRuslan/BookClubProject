namespace Goodreads.Application.Users.Commands.UpdateSocials;

public class UpdateSocialsCommandValidator : AbstractValidator<UpdateSocialsCommand>
{
    public UpdateSocialsCommandValidator()
    {
        RuleFor(x => x.Twitter)
            .MaximumLength(100)
            .Must(BeAValidUrl)
            .When(x => !string.IsNullOrWhiteSpace(x.Twitter))
            .WithMessage("Twitter URL must be valid HTTP/HTTPS URL.");

        RuleFor(x => x.Facebook)
            .MaximumLength(100)
            .Must(BeAValidUrl)
            .When(x => !string.IsNullOrWhiteSpace(x.Facebook))
            .WithMessage("Facebook URL must be valid HTTP/HTTPS URL.");

        RuleFor(x => x.LinkedIn)
            .MaximumLength(100)
            .Must(BeAValidUrl)
            .When(x => !string.IsNullOrWhiteSpace(x.LinkedIn))
            .WithMessage("LinkedIn URL must be valid HTTP/HTTPS URL.");

    }

    private bool BeAValidUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
               && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}

