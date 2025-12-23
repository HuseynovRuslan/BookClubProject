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
        // user-u DB-dən götür
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null) return NotFound("User tapılmadı");

        // Token validation logic
        var isTokenValid = await _userManager.VerifyUserTokenAsync(user, _userManager.Options.Tokens.EmailConfirmationTokenProvider, "EmailConfirmation", token);
        if (!isTokenValid)
            return BadRequest("Token düzgün deyil");

        // 🔹 DB-də email confirmed update
        user.EmailConfirmed = true;
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync();

        return Ok("Hesab təsdiqləndi, indi login edə bilərsiniz");
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
        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
            return BadRequest(ApiResponse.Failure("userId və token tələb olunur", "Validation error"));

        // ASP.NET Core query parametrlərini avtomatik decode edir, amma bəzən iki dəfə encode oluna bilər
        // Ona görə də yenidən decode edirik (təhlükəsiz üçün)
        var decodedToken = System.Net.WebUtility.UrlDecode(token);
        
        // Əgər hələ də encoded görünürsə, yenidən decode et
        if (decodedToken.Contains("%"))
        {
            decodedToken = System.Net.WebUtility.UrlDecode(decodedToken);
        }

        // Token-i yoxla
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
            return BadRequest(ApiResponse.Failure("İstifadəçi tapılmadı", "User not found"));

        var isTokenValid = await _userManager.VerifyUserTokenAsync(user, 
            _userManager.Options.Tokens.PasswordResetTokenProvider, 
            "ResetPassword", 
            decodedToken);
        
        if (!isTokenValid)
            return BadRequest(ApiResponse.Failure("Token etibarsızdır və ya vaxtı keçib", "Invalid token"));

        return Ok(ApiResponse.Success("Token etibarlıdır"));
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (string.IsNullOrEmpty(request.NewPassword))
            return BadRequest(ApiResponse.Failure("Şifrə boş ola bilməz", "Validation error"));

        if (string.IsNullOrEmpty(request.UserId) || string.IsNullOrEmpty(request.Token))
            return BadRequest(ApiResponse.Failure("userId və token tələb olunur", "Validation error"));

        // Token-i decode et (URL-encoded ola bilər)
        var decodedToken = System.Net.WebUtility.UrlDecode(request.Token);
        
        // Əgər hələ də encoded görünürsə, yenidən decode et
        if (decodedToken.Contains("%"))
        {
            decodedToken = System.Net.WebUtility.UrlDecode(decodedToken);
        }

        var command = new ResetPasswordCommand(request.UserId, decodedToken, request.NewPassword);
        var result = await Sender.Send(command);

        return result.Match(
            () => Ok(ApiResponse.Success("Şifrə uğurla yeniləndi.")),
            onFailure => CustomResults.Problem(onFailure));
    }

}
