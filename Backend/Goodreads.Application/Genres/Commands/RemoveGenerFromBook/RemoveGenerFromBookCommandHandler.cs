using Goodreads.Application.Books.Commands.RemoveGenrerFromBook;

namespace Goodreads.Application.Books.Commands.RemoveGenerFromBook;
internal class RemoveGenerFromBookCommandHandler : IRequestHandler<RemoveGenerFromBookCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<RemoveGenerFromBookCommandHandler> _logger;

    public RemoveGenerFromBookCommandHandler(IUnitOfWork unitOfWork, ILogger<RemoveGenerFromBookCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result> Handle(RemoveGenerFromBookCommand request, CancellationToken cancellationToken)
    {
        var book = await _unitOfWork.Books.GetByIdAsync(request.BookId, "BookGenres");
        if (book == null)
        {
            _logger.LogWarning("Book with ID: {BookId} not found", request.BookId);
            return Result.Fail(BookErrors.NotFound(request.BookId));
        }

        var bookGenre = book.BookGenres.FirstOrDefault(bg => bg.GenreId == request.GenreId);
        if (bookGenre == null)
        {
            _logger.LogWarning("Genre with ID: {GenreId} is not associated with Book ID: {BookId}", request.GenreId, request.BookId);
            return Result.Fail(GenreErrors.NotFound(request.GenreId));
        }

        book.BookGenres.Remove(bookGenre);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Successfully removed genre {GenreId} from book {BookId}", request.GenreId, request.BookId);
        return Result.Ok();
    }
}