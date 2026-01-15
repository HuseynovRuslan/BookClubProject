using Goodreads.Application.Common.Interfaces;
using Goodreads.Domain.Entities;
using Goodreads.Domain.Errors;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using SharedKernel;

namespace Goodreads.Application.Users.Commands.DeleteUser;
internal class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, Result>
{
    private readonly ILogger<DeleteUserCommandHandler> _logger;
    private readonly UserManager<User> _userManager;
    private readonly IUserContext _userContext;
    
    public DeleteUserCommandHandler(
        ILogger<DeleteUserCommandHandler> logger, 
        UserManager<User> userManager,
        IUserContext userContext)
    {
        _logger = logger;
        _userManager = userManager;
        _userContext = userContext;
    }
    
    public async Task<Result> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _userContext.UserId;
        if (currentUserId == null)
        {
            return Result.Fail(AuthErrors.Unauthorized);
        }

        // Prevent admin from deleting themselves
        if (currentUserId == request.UserId)
        {
            _logger.LogWarning("Admin attempted to delete their own account: {UserId}", request.UserId);
            return Result.Fail(Error.Validation("Users.CannotDeleteSelf", "You cannot delete your own account"));
        }

        _logger.LogInformation("Admin deleting user with Id : {UserId}", request.UserId);

        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user == null)
        {
            _logger.LogWarning("User not found: {UserId}", request.UserId);
            return Result.Fail(UserErrors.NotFound(request.UserId));
        }

        // Check if user is already deleted
        if (user.IsDeleted)
        {
            _logger.LogWarning("User already deleted: {UserId}", request.UserId);
            return Result.Fail(Error.NotFound("Users.AlreadyDeleted", $"User '{request.UserId}' is already deleted"));
        }

        // Soft delete the user
        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            _logger.LogError("Failed to delete user: {UserId}. Errors: {Errors}", request.UserId, result.Errors);
            return Result.Fail(Error.Failure("Users.DeleteFailed", $"Failed to delete user '{request.UserId}'"));
        }

        _logger.LogInformation("User deleted successfully: {UserId}", request.UserId);
        return Result.Ok();
    }
}
