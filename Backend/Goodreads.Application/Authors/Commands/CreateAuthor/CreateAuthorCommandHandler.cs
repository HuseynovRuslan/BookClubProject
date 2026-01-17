using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace Goodreads.Application.Authors.Commands.CreateAuthor;
internal class CreateAuthorCommandHandler : IRequestHandler<CreateAuthorCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateAuthorCommandHandler> _logger;
    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly IMapper _mapper;
    public CreateAuthorCommandHandler(IUnitOfWork unitOfWork, ILogger<CreateAuthorCommandHandler> logger, IWebHostEnvironment webHostEnvironment, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _webHostEnvironment = webHostEnvironment;
        _mapper = mapper;
    }
    public async Task<Result<string>> Handle(CreateAuthorCommand request, CancellationToken cancellationToken)
    {
        var author = _mapper.Map<Author>(request);

        string? profilePictureUrl = null;
        string? profilePictureBlobName = null;

        if (request.ProfilePicture != null)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var fileExtension = Path.GetExtension(request.ProfilePicture.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
            {
                return Result<string>.Fail(UserErrors.InvalidFileExtension());
            }

            const long maxFileSize = 5 * 1024 * 1024; 
            if (request.ProfilePicture.Length > maxFileSize)
            {
                return Result<string>.Fail(UserErrors.FileTooLarge());
            }

            var imagesFolder = Path.Combine(_webHostEnvironment.WebRootPath ?? _webHostEnvironment.ContentRootPath, "images", "authors");
            if (!Directory.Exists(imagesFolder))
            {
                Directory.CreateDirectory(imagesFolder);
            }

            var fileName = $"{author.Id}_{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(imagesFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.ProfilePicture.CopyToAsync(stream, cancellationToken);
            }

            profilePictureUrl = $"/images/authors/{fileName}";
            profilePictureBlobName = fileName;
        }

        author.ProfilePictureUrl = profilePictureUrl;
        author.ProfilePictureBlobName = profilePictureBlobName;

        await _unitOfWork.Authors.AddAsync(author);
        await _unitOfWork.SaveChangesAsync();

        return Result<string>.Ok(author.Id);
    }
}

