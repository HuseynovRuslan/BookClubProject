using Goodreads.API.Common;
using Goodreads.Application.Auth.Commands.ConfirmEmail;
using Goodreads.Application.Auth.Commands.ForgotPassword;
using Goodreads.Application.Auth.Commands.LoginUser;
using Goodreads.Application.Auth.Commands.Logout;
using Goodreads.Application.Auth.Commands.RefreshToken;
using Goodreads.Application.Auth.Commands.RegisterUser;
using Goodreads.Application.Auth.Commands.ResetEmailConfirmation;
using Goodreads.Application.Auth.Commands.ResetPassword;
using Goodreads.Application.Common.Interfaces;

//using Goodreads.Application.Auth.Commands.ResetPassword;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using Goodreads.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;

namespace Goodreads.API.Controllers;

public class ResetPasswordRequest
{
    public string UserId { get; set; } = default!;
    public string Token { get; set; } = default!;
    public string NewPassword { get; set; } = default!;
}

[ApiController]
[Route("api/[controller]")]
public class AuthController : BaseController
{
    private readonly UserManager<User> _userManager;
    private readonly IUnitOfWork _unitOfWork;


    public AuthController(UserManager<User> userManager, IUnitOfWork unitOfWork)
    {
        _userManager = userManager;
        _unitOfWork = unitOfWork;
    }

    [HttpPost("register")]


    public async Task<IActionResult> Register([FromBody] RegisterUserCommand command)
    {
        var result = await Sender.Send(command);

        return result.Match(
        success => Ok(ApiResponse<string>.Success(success, "Registration successful! Please check your email to confirm your account.")),
        failure => CustomResults.Problem(failure));
    }





    [HttpPost("login")]


    public async Task<IActionResult> Login([FromBody] LoginUserCommand command)
    {
        var result = await Sender.Send(command);

        return result.Match(
            success => Ok(ApiResponse<AuthResultDto>.Success(success, "Login successful")),
            failure => CustomResults.Problem(failure));
    }

    [HttpPost("refresh")]


    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command)
    {
        var result = await Sender.Send(command);
        return result.Match(
            success => Ok(ApiResponse<AuthResultDto>.Success(success, "Token refreshed successfully")),
            failure => CustomResults.Problem(failure));
    }

    [HttpPost("logout")]
    [Authorize]


    public async Task<IActionResult> Logout()
    {
        var result = await Sender.Send(new LogoutCommand());
        return result.Match(
            () => Ok(ApiResponse.Success("Logout successful")),
            failure => CustomResults.Problem(failure));
    }


    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string token)
    {
        const string frontendUrl = "http://localhost:5173";
        
        // user-u DB-dən götür
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
            return Content(GetEmailConfirmationPage(false, "User not found. The account may have been deleted.", frontendUrl), "text/html");

        // Token validation logic
        var isTokenValid = await _userManager.VerifyUserTokenAsync(user, _userManager.Options.Tokens.EmailConfirmationTokenProvider, "EmailConfirmation", token);
        if (!isTokenValid)
            return Content(GetEmailConfirmationPage(false, "Invalid or expired token. Please request a new verification email.", frontendUrl), "text/html");

        // Check if already confirmed
        if (user.EmailConfirmed)
            return Content(GetEmailConfirmationPage(true, "Your email is already verified! You can login now.", frontendUrl), "text/html");

        // 🔹 DB-də email confirmed update
        user.EmailConfirmed = true;
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync();

        return Content(GetEmailConfirmationPage(true, "Your email has been verified successfully!", frontendUrl), "text/html");
    }

    private static string GetEmailConfirmationPage(bool success, string message, string frontendUrl)
    {
        var icon = success ? "✅" : "❌";
        var title = success ? "Email Verified!" : "Verification Failed";
        var bgColor = success ? "#f0fdf4" : "#fef2f2";
        var borderColor = success ? "#22c55e" : "#ef4444";
        var textColor = success ? "#166534" : "#991b1b";
        var buttonText = success ? "Continue to Login" : "Back to Home";
        var buttonLink = success ? $"{frontendUrl}/login?verified=true" : frontendUrl;

        return $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>{title} - BookClub</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }}
        .container {{
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
            max-width: 440px;
            width: 100%;
            overflow: hidden;
        }}
        .header {{
            background: #1c1917;
            padding: 40px 32px;
            text-align: center;
        }}
        .logo {{
            font-size: 48px;
            margin-bottom: 12px;
        }}
        .brand {{
            color: white;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }}
        .tagline {{
            color: #a8a29e;
            font-size: 14px;
            margin-top: 8px;
        }}
        .content {{
            padding: 48px 32px;
            text-align: center;
        }}
        .status-icon {{
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: {bgColor};
            border: 3px solid {borderColor};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            margin: 0 auto 24px;
        }}
        .title {{
            color: #1c1917;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 12px;
        }}
        .message {{
            color: #57534e;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 32px;
        }}
        .btn {{
            display: inline-block;
            background: #1c1917;
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            transition: background 0.2s;
        }}
        .btn:hover {{
            background: #292524;
        }}
        .footer {{
            background: #f5f5f4;
            padding: 20px 32px;
            text-align: center;
            border-top: 1px solid #e7e5e4;
        }}
        .footer p {{
            color: #a8a29e;
            font-size: 12px;
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <div class=""logo"">📚</div>
            <div class=""brand"">BookClub</div>
            <div class=""tagline"">Your Reading Community</div>
        </div>
        <div class=""content"">
            <div class=""status-icon"">{icon}</div>
            <h1 class=""title"">{title}</h1>
            <p class=""message"">{message}</p>
            <a href=""{buttonLink}"" class=""btn"">{buttonText}</a>
        </div>
        <div class=""footer"">
            <p>© {DateTime.UtcNow.Year} BookClub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";
    }

    [HttpPost("reset-confirmation-email")]
    public async Task<IActionResult> ResetEmailConfirmation([FromBody] ResetEmailConfirmationCommand command)
    {
        var result = await Sender.Send(command);

        return result.Match(
            success => Ok(ApiResponse<string>.Success(success, "New confirmation email link generated.")),
            failure => CustomResults.Problem(failure));
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command)
    {
        var result = await Sender.Send(command);

        return result.Match(
            resetLink => Ok(ApiResponse<string>.Success(resetLink, "Password reset link sent to your email.")),
            onFailure => CustomResults.Problem(onFailure));
    }

    [HttpGet("reset-password")]
    public async Task<IActionResult> ValidateResetPasswordToken([FromQuery] string userId, [FromQuery] string token)
    {
        const string frontendUrl = "http://localhost:5173";
        
        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
            return Content(GetPasswordResetPage(false, "Invalid Link", "The password reset link is invalid or incomplete.", frontendUrl), "text/html");

        // Check if user exists
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
            return Content(GetPasswordResetPage(false, "User Not Found", "The user associated with this link no longer exists.", frontendUrl), "text/html");

        // ASP.NET Core auto-decodes URL params, so 'token' here is the raw token
        // We need to URL-encode it for the redirect URL (browser will decode it when reading from searchParams)
        var encodedToken = System.Net.WebUtility.UrlEncode(token);
        return Redirect($"{frontendUrl}/reset-password?userId={userId}&token={encodedToken}");
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (string.IsNullOrEmpty(request.NewPassword))
            return BadRequest(ApiResponse.Failure("Password cannot be empty", "Validation error"));

        if (string.IsNullOrEmpty(request.UserId) || string.IsNullOrEmpty(request.Token))
            return BadRequest(ApiResponse.Failure("Invalid request parameters", "Validation error"));

        // Token comes from frontend URL params (already decoded by browser)
        // Just use it directly - ResetPasswordAsync expects the raw token
        var command = new ResetPasswordCommand(request.UserId, request.Token, request.NewPassword);
        var result = await Sender.Send(command);

        return result.Match(
            () => Ok(ApiResponse.Success("Password reset successfully!")),
            onFailure => CustomResults.Problem(onFailure));
    }

    private static string GetPasswordResetPage(bool success, string title, string message, string frontendUrl)
    {
        var icon = success ? "✅" : "❌";
        var bgColor = success ? "#f0fdf4" : "#fef2f2";
        var borderColor = success ? "#22c55e" : "#ef4444";
        var buttonText = success ? "Continue to Login" : "Request New Link";
        var buttonLink = success ? $"{frontendUrl}/login?reset=true" : $"{frontendUrl}/forgot-password";

        return $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>{title} - BookClub</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }}
        .container {{
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
            max-width: 440px;
            width: 100%;
            overflow: hidden;
        }}
        .header {{
            background: #1c1917;
            padding: 40px 32px;
            text-align: center;
        }}
        .logo {{ font-size: 48px; margin-bottom: 12px; }}
        .brand {{ color: white; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }}
        .tagline {{ color: #a8a29e; font-size: 14px; margin-top: 8px; }}
        .content {{ padding: 48px 32px; text-align: center; }}
        .status-icon {{
            width: 80px; height: 80px; border-radius: 50%;
            background: {bgColor}; border: 3px solid {borderColor};
            display: flex; align-items: center; justify-content: center;
            font-size: 40px; margin: 0 auto 24px;
        }}
        .title {{ color: #1c1917; font-size: 24px; font-weight: 600; margin-bottom: 12px; }}
        .message {{ color: #57534e; font-size: 16px; line-height: 1.6; margin-bottom: 32px; }}
        .btn {{
            display: inline-block; background: #1c1917; color: white;
            text-decoration: none; padding: 14px 32px; border-radius: 10px;
            font-size: 16px; font-weight: 600; transition: background 0.2s;
        }}
        .btn:hover {{ background: #292524; }}
        .footer {{ background: #f5f5f4; padding: 20px 32px; text-align: center; border-top: 1px solid #e7e5e4; }}
        .footer p {{ color: #a8a29e; font-size: 12px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <div class=""logo"">🔐</div>
            <div class=""brand"">BookClub</div>
            <div class=""tagline"">Password Reset</div>
        </div>
        <div class=""content"">
            <div class=""status-icon"">{icon}</div>
            <h1 class=""title"">{title}</h1>
            <p class=""message"">{message}</p>
            <a href=""{buttonLink}"" class=""btn"">{buttonText}</a>
        </div>
        <div class=""footer"">
            <p>© {DateTime.UtcNow.Year} BookClub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";
    }

}
