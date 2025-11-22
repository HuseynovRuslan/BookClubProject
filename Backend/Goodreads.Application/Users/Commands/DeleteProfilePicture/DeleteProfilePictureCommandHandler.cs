using Microsoft.AspNetCore.Hosting;

namespace Goodreads.Application.Users.Commands.DeleteProfilePicture;
internal class DeleteProfilePictureCommandHandler : IRequestHandler<DeleteProfilePictureCommand, Result>
{
    private readonly ILogger<DeleteProfilePictureCommandHandler> _logger;
    private readonly IUserContext _userContext;
    private readonly UserManager<User> _userManager;
    private readonly IWebHostEnvironment _webHostEnvironment;

    public DeleteProfilePictureCommandHandler(
        ILogger<DeleteProfilePictureCommandHandler> logger,
        IUserContext userContext,
        UserManager<User> userManager,
        IWebHostEnvironment webHostEnvironment)
    {
        _logger = logger;
        _userContext = userContext;
        _userManager = userManager;
        _webHostEnvironment = webHostEnvironment;
    }
    
    public async Task<Result> Handle(DeleteProfilePictureCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            return Result.Fail(AuthErrors.Unauthorized);

        _logger.LogInformation("Deleting Profile Picture user with Id : {UserId}", userId);

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            _logger.LogWarning("User not found: {UserId}", userId);
            return Result.Fail(UserErrors.NotFound(userId));
        }

        // Delete physical file if exists
        if (!string.IsNullOrEmpty(user.ProfilePictureBlobName))
        {
            var imagesFolder = Path.Combine(_webHostEnvironment.WebRootPath ?? _webHostEnvironment.ContentRootPath, "images", "profiles");
            var filePath = Path.Combine(imagesFolder, user.ProfilePictureBlobName);
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }

        user.ProfilePictureBlobName = null;
        user.ProfilePictureUrl = null;

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            _logger.LogError("Failed to update profile picture for user: {UserId}. Errors: {Errors}", userId, result.Errors);
            return Result.Fail(UserErrors.UpdateFailed(userId));
        }

        return Result.Ok();
    }
}

