namespace Goodreads.Application.Books.Commands.CreateBook;
public class CreateBookCommandHandler : IRequestHandler<CreateBookCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<CreateBookCommandHandler> _logger;
    private readonly ILocalStorageService _blobStorageService;
    public CreateBookCommandHandler(IUnitOfWork unitOfWork, IMapper mapper, ILogger<CreateBookCommandHandler> logger, ILocalStorageService blobStorageService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
        _blobStorageService = blobStorageService;
    }
    public async Task<Result<string>> Handle(CreateBookCommand request, CancellationToken cancellationToken)
    {
        var author = await _unitOfWork.Authors.GetByIdAsync(request.AuthorId);
        if (author == null)
        {
            _logger.LogWarning("Author with ID: {AuthorId} not found", request.AuthorId);
            return Result<string>.Fail(AuthorErrors.NotFound(request.AuthorId));
        }

        var existingBookByIsbn = await _unitOfWork.Books.GetSingleOrDefaultAsync(
            b => b.ISBN == request.ISBN && !b.IsDeleted);
        if (existingBookByIsbn != null)
        {
            _logger.LogWarning("Book with ISBN {ISBN} already exists", request.ISBN);
            return Result<string>.Fail(Error.Conflict("Books.DuplicateISBN", $"A book with ISBN '{request.ISBN}' already exists"));
        }

        var existingBookByTitle = await _unitOfWork.Books.GetSingleOrDefaultAsync(
            b => b.Title.ToLower() == request.Title.ToLower() && !b.IsDeleted);
        if (existingBookByTitle != null)
        {
            _logger.LogWarning("Book with title '{Title}' already exists", request.Title);
            return Result<string>.Fail(Error.Conflict("Books.DuplicateTitle", $"A book with title '{request.Title}' already exists"));
        }

        var book = _mapper.Map<Book>(request);
        book.Author = author;
        book.CreatedAt = DateTime.UtcNow;

        if (request.CoverImage != null)
        {
            using var stream = request.CoverImage.OpenReadStream();
            var (url, blobName) = await _blobStorageService.UploadAsync(request.CoverImage.FileName, stream, LocalContainer.Books);
            book.CoverImageUrl = url;
            book.CoverImageBlobName = blobName;
        }

        await _unitOfWork.Books.AddAsync(book);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Book created successfully with ID: {BookId}", book.Id);
        return Result<string>.Ok(book.Id);
    }
}