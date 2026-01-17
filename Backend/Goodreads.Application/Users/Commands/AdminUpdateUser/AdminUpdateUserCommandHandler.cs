using Goodreads.Domain.Errors;
using SharedKernel;
using Goodreads.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace Goodreads.Application.Users.Commands.AdminUpdateUser;

public class AdminUpdateUserCommandHandler : IRequestHandler<AdminUpdateUserCommand, Result>
{
    private readonly UserManager<User> _userManager;
    private readonly ILogger<AdminUpdateUserCommandHandler> _logger;

    public AdminUpdateUserCommandHandler(UserManager<User> userManager, ILogger<AdminUpdateUserCommandHandler> logger)
    {
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<Result> Handle(AdminUpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user == null)
        {
            return Result.Fail(UserErrors.NotFound(request.UserId));
        }

        if (!string.IsNullOrWhiteSpace(request.FirstName) && request.FirstName != "string")
            user.FirstName = request.FirstName;

        if (!string.IsNullOrWhiteSpace(request.LastName) && request.LastName != "string")
            user.LastName = request.LastName;

        bool emailChanged = false;
        if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != "string" && user.Email != request.Email)
        {
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null && existingUser.Id != user.Id)
            {
                return Result.Fail(Error.Conflict("User.EmailAlreadyExists", $"Email '{request.Email}' is already taken."));
            }
            
            // For admin update, we directly set the email and confirm it to avoid locking the user out
            user.Email = request.Email;
            user.NormalizedEmail = _userManager.NormalizeEmail(request.Email);
            user.EmailConfirmed = true; 
            emailChanged = true;
        }

        if (!string.IsNullOrWhiteSpace(request.UserName) && request.UserName != "string" && user.UserName != request.UserName)
        {
             var existingUser = await _userManager.FindByNameAsync(request.UserName);
            if (existingUser != null && existingUser.Id != user.Id)
            {
                return Result.Fail(Error.Conflict("User.UserNameAlreadyExists", $"Username '{request.UserName}' is already taken."));
            }

            user.UserName = request.UserName;
            user.NormalizedUserName = _userManager.NormalizeName(request.UserName);
        }

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            _logger.LogError("Failed to update user {UserId} by admin. Errors: {Errors}", request.UserId, errors);
            return Result.Fail(Error.Failure("User.UpdateFailed", "Failed to update user details."));
        }

        _logger.LogInformation("User {UserId} updated successfully by admin.", request.UserId);
        return Result.Ok();
    }
}
