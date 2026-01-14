using System.Net;
using Goodreads.Application.Common.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace Goodreads.Application.Auth.Commands.ForgotPassword;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, Result<string>>
{
    private readonly UserManager<User> _userManager;
    private readonly IEmailService _emailService;

    public ForgotPasswordCommandHandler(UserManager<User> userManager, IEmailService emailService)
    {
        _userManager = userManager;
        _emailService = emailService;
    }

    public async Task<Result<string>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return Result<string>.Fail(UserErrors.NotFound(request.Email));

        // Password reset token yaradılır
        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = WebUtility.UrlEncode(token);
        var resetLink = $"https://localhost:7050/api/auth/reset-password?userId={user.Id}&token={encodedToken}";

        // Send password reset email using clean email service
        await _emailService.SendPasswordResetEmailAsync(user.Email!, user.UserName ?? "Reader", resetLink);

        return Result<string>.Ok(resetLink);
    }
}
