using System.Net;
using Microsoft.Extensions.Configuration;

namespace Goodreads.Application.Auth.Commands.ResetEmailConfirmation;
internal class ResetEmailConfirmationCommandHandler : IRequestHandler<ResetEmailConfirmationCommand, Result<string>>
{
    private readonly UserManager<User> _userManager;
    private readonly IEmailService _emailService;
    private readonly ILogger<ResetEmailConfirmationCommandHandler> _logger;
    private readonly IConfiguration _configuration;

    public ResetEmailConfirmationCommandHandler(
        UserManager<User> userManager,
        IEmailService emailService,
        ILogger<ResetEmailConfirmationCommandHandler> logger,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _emailService = emailService;
        _logger = logger;
        _configuration = configuration;
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
        var backendUrl = _configuration["BackendUrl"] ?? "http://localhost:7050";
        var confirmationLink = $"{backendUrl}/api/auth/confirm-email?userId={user.Id}&token={encodedToken}";

        // Send verification email using clean email service
        try
        {
            await _emailService.SendVerificationEmailAsync(user.Email!, user.UserName ?? "Reader", confirmationLink);
            _logger.LogInformation("Confirmation email sent successfully to: {Email}", request.email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send confirmation email to: {Email}", request.email);
            return Result<string>.Fail(Error.Failure("EmailError", "Failed to send confirmation email. Please try again."));
        }

        return Result<string>.Ok("Confirmation email sent successfully!");
    }
}

