using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace Goodreads.Application.Users.Commands.UpdateProfilePicture;
internal class UpdateProfilePictureCommandHandler : IRequestHandler<UpdateProfilePictureCommand, Result>
{
    private readonly ILogger<UpdateProfilePictureCommandHandler> _logger;
    private readonly IUserContext _userContext;
    private readonly UserManager<User> _userManager;
    private readonly IWebHostEnvironment _webHostEnvironment;

    public UpdateProfilePictureCommandHandler(
        ILogger<UpdateProfilePictureCommandHandler> logger,
        IUserContext userContext,
        UserManager<User> userManager,
        IWebHostEnvironment webHostEnvironment)
    {
        _logger = logger;
        _userContext = userContext;
        _userManager = userManager;
        _webHostEnvironment = webHostEnvironment;
    }

    public async Task<Result> Handle(UpdateProfilePictureCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            return Result.Fail(AuthErrors.Unauthorized);

        _logger.LogInformation("Updating Profile Picture user with Id : {UserId}", userId);

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            _logger.LogWarning("User not found: {UserId}", userId);
            return Result.Fail(UserErrors.NotFound(userId));
        }

        // Validate file extension
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
        var fileExtension = Path.GetExtension(request.File.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(fileExtension))
        {
            return Result.Fail(UserErrors.InvalidFileExtension());
        }

        // Validate file size (max 5MB)
        const long maxFileSize = 5 * 1024 * 1024; // 5MB
        if (request.File.Length > maxFileSize)
        {
            return Result.Fail(UserErrors.FileTooLarge());
        }

        // Create images directory if it doesn't exist
        var imagesFolder = Path.Combine(_webHostEnvironment.WebRootPath ?? _webHostEnvironment.ContentRootPath, "images", "profiles");
        if (!Directory.Exists(imagesFolder))
        {
            Directory.CreateDirectory(imagesFolder);
        }

        // Delete old profile picture if exists
        if (!string.IsNullOrEmpty(user.ProfilePictureBlobName))
        {
            var oldFilePath = Path.Combine(imagesFolder, user.ProfilePictureBlobName);
            if (File.Exists(oldFilePath))
            {
                File.Delete(oldFilePath);
            }
        }

        // Generate unique file name
        var fileName = $"{userId}_{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(imagesFolder, fileName);

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await request.File.CopyToAsync(stream, cancellationToken);
        }

        // Update user
        user.ProfilePictureUrl = $"/images/profiles/{fileName}";
        user.ProfilePictureBlobName = fileName;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            _logger.LogError("Failed to update profile picture for user: {UserId}. Errors: {Errors}", userId, result.Errors);
            return Result.Fail(UserErrors.UpdateFailed(userId));
        }

        return Result.Ok();
    }
}

