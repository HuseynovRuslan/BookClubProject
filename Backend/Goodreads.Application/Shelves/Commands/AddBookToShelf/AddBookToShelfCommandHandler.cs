namespace Goodreads.Application.Shelves.Commands.AddBookToShelf;
internal class AddBookToShelfCommandHandler : IRequestHandler<AddBookToShelfCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AddBookToShelfCommandHandler> _logger;
    private readonly IUserContext _userContext;

    public AddBookToShelfCommandHandler(IUnitOfWork unitOfWork, ILogger<AddBookToShelfCommandHandler> logger, IUserContext userContext)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _userContext = userContext;
    }

    public async Task<Result> Handle(AddBookToShelfCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            return Result.Fail(AuthErrors.Unauthorized);

        var shelf = await _unitOfWork.Shelves.GetByIdAsync(request.ShelfId, "BookShelves");
        if (shelf == null)
        {
            _logger.LogWarning("Shelf {ShelfId} not found", request.ShelfId);
            return Result.Fail(ShelfErrors.NotFound(request.ShelfId));
        }

        // Check if user owns the shelf
        if (shelf.UserId != userId)
        {
            _logger.LogWarning("User {UserId} attempted to add book to shelf {ShelfId} owned by {OwnerId}", userId, request.ShelfId, shelf.UserId);
            return Result.Fail(Error.Forbidden("Shelves.Unauthorized", "You are not authorized to modify this shelf."));
        }

        var book = await _unitOfWork.Books.GetByIdAsync(request.BookId);
        if (book == null)
        {
            _logger.LogWarning("Book {BookId} not found", request.BookId);
            return Result.Fail(BookErrors.NotFound(request.BookId));
        }

        if (shelf.IsDefault)
            return Result.Fail(ShelfErrors.DefaultShelfAddDenied(shelf.Name));

        // Check if book is already in shelf
        if (shelf.BookShelves.Any(bs => bs.BookId == request.BookId))
        {
            return Result.Fail(ShelfErrors.AlreadyAdded);
        }

        var toAdd = new BookShelf
        {
            ShelfId = shelf.Id,
            BookId = book.Id,
            AddedAt = DateTime.UtcNow
        };

        shelf.BookShelves.Add(toAdd);

        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Book {BookId} added to Shelf {ShelfId}", request.BookId, request.ShelfId);

        return Result.Ok();
    }
}

