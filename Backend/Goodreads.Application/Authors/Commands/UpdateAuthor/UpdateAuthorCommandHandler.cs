using Microsoft.AspNetCore.Hosting;

namespace Goodreads.Application.Authors.Commands.UpdateAuthor;
internal class UpdateAuthorCommandHandler : IRequestHandler<UpdateAuthorCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateAuthorCommandHandler> _logger;
    private readonly IWebHostEnvironment _webHostEnvironment;

    public UpdateAuthorCommandHandler(IUnitOfWork unitOfWork, ILogger<UpdateAuthorCommandHandler> logger, IWebHostEnvironment webHostEnvironment)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _webHostEnvironment = webHostEnvironment;
    }

    public async Task<Result> Handle(UpdateAuthorCommand request, CancellationToken cancellationToken)
    {
        var authorId = request.AuthorId;
        _logger.LogInformation("Updating author with ID: {AuthorId}", authorId);
        var author = await _unitOfWork.Authors.GetByIdAsync(authorId);
        if (author == null)
        {
            _logger.LogWarning("Author with ID: {AuthorId} not found", authorId);
            return Result.Fail(AuthorErrors.NotFound(authorId));
        }

        if (!string.IsNullOrEmpty(request.Name))
            author.Name = request.Name;

        if (!string.IsNullOrEmpty(request.Bio))
            author.Bio = request.Bio;

        if (request.ProfilePicture != null)
        {
            // Validate file extension
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var fileExtension = Path.GetExtension(request.ProfilePicture.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
            {
                return Result.Fail(UserErrors.InvalidFileExtension());
            }

            // Validate file size (max 5MB)
            const long maxFileSize = 5 * 1024 * 1024; // 5MB
            if (request.ProfilePicture.Length > maxFileSize)
            {
                return Result.Fail(UserErrors.FileTooLarge());
            }

            // Get images folder path
            var imagesFolder = Path.Combine(_webHostEnvironment.WebRootPath ?? _webHostEnvironment.ContentRootPath, "images", "authors");
            
            // Create images directory if it doesn't exist
            if (!Directory.Exists(imagesFolder))
            {
                Directory.CreateDirectory(imagesFolder);
            }

            // Delete old profile picture if exists
            if (!string.IsNullOrEmpty(author.ProfilePictureBlobName))
            {
                var oldFilePath = Path.Combine(imagesFolder, author.ProfilePictureBlobName);
                if (File.Exists(oldFilePath))
                {
                    File.Delete(oldFilePath);
                }
            }

            // Generate unique file name
            var fileName = $"{author.Id}_{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(imagesFolder, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.ProfilePicture.CopyToAsync(stream, cancellationToken);
            }

            author.ProfilePictureUrl = $"/images/authors/{fileName}";
            author.ProfilePictureBlobName = fileName;
        }

        _unitOfWork.Authors.Update(author);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Author with ID: {AuthorId} updated successfully", authorId);
        return Result.Ok();
    }
}

