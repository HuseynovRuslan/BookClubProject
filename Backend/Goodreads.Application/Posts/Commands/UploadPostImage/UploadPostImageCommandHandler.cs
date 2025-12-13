using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace Goodreads.Application.Posts.Commands.UploadPostImage;

internal class UploadPostImageCommandHandler : IRequestHandler<UploadPostImageCommand, Result<string>>
{
    private readonly ILogger<UploadPostImageCommandHandler> _logger;
    private readonly IUserContext _userContext;
    private readonly IWebHostEnvironment _webHostEnvironment;

    public UploadPostImageCommandHandler(
        ILogger<UploadPostImageCommandHandler> logger,
        IUserContext userContext,
        IWebHostEnvironment webHostEnvironment)
    {
        _logger = logger;
        _userContext = userContext;
        _webHostEnvironment = webHostEnvironment;
    }

    public async Task<Result<string>> Handle(UploadPostImageCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            return Result<string>.Fail(AuthErrors.Unauthorized);

        _logger.LogInformation("Uploading post image for user with Id: {UserId}", userId);

        // Validate file extension
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        var fileExtension = Path.GetExtension(request.File.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(fileExtension))
        {
            return Result<string>.Fail(UserErrors.InvalidFileExtension());
        }

        // Validate file size (max 10MB for posts)
        const long maxFileSize = 10 * 1024 * 1024; // 10MB
        if (request.File.Length > maxFileSize)
        {
            return Result<string>.Fail(UserErrors.FileTooLarge());
        }

        // Create images/posts directory if it doesn't exist
        var imagesFolder = Path.Combine(_webHostEnvironment.WebRootPath ?? _webHostEnvironment.ContentRootPath, "images", "posts");
        if (!Directory.Exists(imagesFolder))
        {
            Directory.CreateDirectory(imagesFolder);
        }

        // Generate unique file name
        var fileName = $"{userId}_{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(imagesFolder, fileName);

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await request.File.CopyToAsync(stream, cancellationToken);
        }

        // Return the URL path
        var imageUrl = $"/images/posts/{fileName}";
        _logger.LogInformation("Post image uploaded successfully: {ImageUrl}", imageUrl);

        return Result<string>.Ok(imageUrl);
    }
}

