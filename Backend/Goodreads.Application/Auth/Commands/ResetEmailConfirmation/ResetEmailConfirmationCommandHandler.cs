using System.Net;

namespace Goodreads.Application.Auth.Commands.ResetEmailConfirmation;
internal class ResetEmailConfirmationCommandHandler : IRequestHandler<ResetEmailConfirmationCommand, Result<string>>
{
    private readonly UserManager<User> _userManager;
    private readonly IEmailService _emailService;
    private readonly ILogger<ResetEmailConfirmationCommandHandler> _logger;

    public ResetEmailConfirmationCommandHandler(
        UserManager<User> userManager,
        IEmailService emailService,
        ILogger<ResetEmailConfirmationCommandHandler> logger)
    {
        _userManager = userManager;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<Result<string>> Handle(ResetEmailConfirmationCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Resetting email confirmation for: {Email}", request.email);

        var user = await _userManager.FindByEmailAsync(request.email);
        if (user == null)
        {
            _logger.LogWarning("User not found with email: {Email}", request.email);
            return Result<string>.Fail(UserErrors.NotFound(request.email));
        }

        if (user.EmailConfirmed)
        {
            _logger.LogInformation("Email already confirmed for user: {Email}", request.email);
            return Result<string>.Fail(UserErrors.EmailAlreadyConfirmed(user.Id));
        }

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = WebUtility.UrlEncode(token);

        var confirmationLink = $"https://localhost:7050/api/auth/confirm-email?userId={user.Id}&token={encodedToken}"; // Should be Frontend

        // await _emailService.SendEmailAsync(user.Email!, "Confirm your email", $"Click <a href='{confirmationLink}'>here</a> to confirm your email.");

        _logger.LogInformation("Email confirmation link generated for user: {Email}", request.email);

        return Result<string>.Ok(confirmationLink);
    }
}

