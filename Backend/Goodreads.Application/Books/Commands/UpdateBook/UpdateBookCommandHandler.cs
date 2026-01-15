using Goodreads.Application.Common.Interfaces;
using Goodreads.Domain.Constants;

namespace Goodreads.Application.Books.Commands.UpdateBook;
internal class UpdateBookCommandHandler : IRequestHandler<UpdateBookCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateBookCommandHandler> _logger;
    private readonly IMapper _mapper;
    private readonly ILocalStorageService _localStorageService;

    public UpdateBookCommandHandler(
        IUnitOfWork unitOfWork, 
        ILogger<UpdateBookCommandHandler> logger, 
        IMapper mapper,
        ILocalStorageService localStorageService)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _mapper = mapper;
        _localStorageService = localStorageService;
    }

    public async Task<Result> Handle(UpdateBookCommand request, CancellationToken cancellationToken)
    {
        var book = await _unitOfWork.Books.GetByIdAsync(request.Id, "Author", "BookGenres");

        if (book == null)
        {
            _logger.LogWarning("Book with ID: {BookId} not found", request.Id);
            return Result.Fail(BookErrors.NotFound(request.Id));
        }

        _mapper.Map(request, book);

        if (request.PageCount is not null)
            book.PageCount = request.PageCount.Value;

        if (request.AuthorId is not null)
        {
            var author = await _unitOfWork.Authors.GetByIdAsync(request.AuthorId);
            if (author == null)
            {
                _logger.LogWarning("Author with ID: {AuthorId} not found", request.AuthorId);
                return Result.Fail(AuthorErrors.NotFound(request.AuthorId));
            }
            book.Author = author;
        }

        // Check if ISBN already exists (excluding current book)
        if (!string.IsNullOrEmpty(request.ISBN) && request.ISBN != book.ISBN)
        {
            var existingBookByIsbn = await _unitOfWork.Books.GetSingleOrDefaultAsync(
                b => b.ISBN == request.ISBN && b.Id != request.Id && !b.IsDeleted);
            if (existingBookByIsbn != null)
            {
                _logger.LogWarning("Book with ISBN {ISBN} already exists", request.ISBN);
                return Result.Fail(Error.Conflict("Books.DuplicateISBN", $"A book with ISBN '{request.ISBN}' already exists"));
            }
        }

        // Check if book with same title already exists (excluding current book)
        if (!string.IsNullOrEmpty(request.Title) && request.Title.ToLower() != book.Title.ToLower())
        {
            var existingBookByTitle = await _unitOfWork.Books.GetSingleOrDefaultAsync(
                b => b.Title.ToLower() == request.Title.ToLower() && b.Id != request.Id && !b.IsDeleted);
            if (existingBookByTitle != null)
            {
                _logger.LogWarning("Book with title '{Title}' already exists", request.Title);
                return Result.Fail(Error.Conflict("Books.DuplicateTitle", $"A book with title '{request.Title}' already exists"));
            }
        }

        // Update cover image if provided
        if (request.CoverImage != null)
        {
            // Delete old cover image if exists
            if (!string.IsNullOrEmpty(book.CoverImageBlobName))
            {
                await _localStorageService.DeleteAsync(LocalContainer.Books, book.CoverImageBlobName);
            }

            // Upload new cover image
            using var stream = request.CoverImage.OpenReadStream();
            var (url, blobName) = await _localStorageService.UploadAsync(request.CoverImage.FileName, stream, LocalContainer.Books);
            book.CoverImageUrl = url;
            book.CoverImageBlobName = blobName;
        }

        await _unitOfWork.SaveChangesAsync();
        
        _logger.LogInformation("Book with ID: {BookId} updated successfully", request.Id);
        return Result.Ok();
    }
}