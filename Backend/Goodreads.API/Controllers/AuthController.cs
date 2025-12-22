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
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command)
    {
        var result = await Sender.Send(command);

        return result.Match(
            resetLink => Ok(ApiResponse<string>.Success(resetLink, "Password reset link sent to your email.")),
            onFailure => CustomResults.Problem(onFailure));
    }

    //[HttpPost("reset-password")]
    //public async Task<IActionResult> ResetPassword([FromQuery] string userId, [FromQuery] string token, [FromBody] ResetPasswordRequest request)
    //{
    //    var command = new ResetPasswordCommand(userId, token, request.NewPassword);
    //    var result = await Sender.Send(command);

    //    return result.Match(
    //        () => Ok(ApiResponse.Success("Password reset successfully.")),
    //        onFailure => CustomResults.Problem(onFailure));
    //}

}
