using Goodreads.Application.Common.Interfaces;
using Goodreads.Domain.Constants;

namespace Goodreads.Application.Books.Commands.DeleteBook.DeleteBookCommand;
internal class DeleteBookCommandHandler : IRequestHandler<DeleteBookCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DeleteBookCommandHandler> _logger;
    private readonly ILocalStorageService _localStorageService;

    public DeleteBookCommandHandler(
        IUnitOfWork unitOfWork, 
        ILogger<DeleteBookCommandHandler> logger,
        ILocalStorageService localStorageService)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _localStorageService = localStorageService;
    }

    public async Task<Result> Handle(DeleteBookCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling DeleteBookCommand for book with ID: {BookId}", request.Id);
        
        var book = await _unitOfWork.Books.GetByIdAsync(request.Id);
        if (book == null)
        {
            _logger.LogWarning("Book with ID: {BookId} not found", request.Id);
            return Result.Fail(BookErrors.NotFound(request.Id));
        }

        // Delete cover image if exists
        if (!string.IsNullOrEmpty(book.CoverImageBlobName))
        {
            await _localStorageService.DeleteAsync(LocalContainer.Books, book.CoverImageBlobName);
        }

        book.IsDeleted = true;
        book.DeletedAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Successfully deleted book with ID: {BookId}", request.Id);
        return Result.Ok();
    }
}