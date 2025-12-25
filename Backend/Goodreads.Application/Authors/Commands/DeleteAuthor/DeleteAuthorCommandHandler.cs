using Microsoft.AspNetCore.Hosting;

namespace Goodreads.Application.Authors.Commands.DeleteAuthor;
internal class DeleteAuthorCommandHandler : IRequestHandler<DeleteAuthorCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly ILogger<DeleteAuthorCommandHandler> _logger;

    public DeleteAuthorCommandHandler(IUnitOfWork unitOfWork, IWebHostEnvironment webHostEnvironment, ILogger<DeleteAuthorCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _webHostEnvironment = webHostEnvironment;
        _logger = logger;
    }
    public async Task<Result> Handle(DeleteAuthorCommand request, CancellationToken cancellationToken)
    {
        var authorId = request.Id;
        _logger.LogInformation("Deleting author with ID: {AuthorId}", authorId);
        var author = await _unitOfWork.Authors.GetByIdAsync(authorId);
        if (author == null)
        {
            _logger.LogWarning("Author with ID: {AuthorId} not found", authorId);
            return Result.Fail(AuthorErrors.NotFound(authorId));
        }

        // Delete profile picture if exists
        if (!string.IsNullOrEmpty(author.ProfilePictureBlobName))
        {
            var imagesFolder = Path.Combine(_webHostEnvironment.WebRootPath ?? _webHostEnvironment.ContentRootPath, "images", "authors");
            var filePath = Path.Combine(imagesFolder, author.ProfilePictureBlobName);
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }

        author.IsDeleted = true;
        author.DeletedAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();

        return Result.Ok();
    }
}

