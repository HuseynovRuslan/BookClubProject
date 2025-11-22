namespace Goodreads.Application.Shelves.Commands.RemoveBookFromShelf;
internal class RemoveBookFromShelfCommandHandler : IRequestHandler<RemoveBookFromShelfCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<RemoveBookFromShelfCommandHandler> _logger;
    private readonly IUserContext _userContext;

    public RemoveBookFromShelfCommandHandler(IUnitOfWork unitOfWork, ILogger<RemoveBookFromShelfCommandHandler> logger, IUserContext userContext)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _userContext = userContext;
    }

    public async Task<Result> Handle(RemoveBookFromShelfCommand request, CancellationToken cancellationToken)
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
            _logger.LogWarning("User {UserId} attempted to remove book from shelf {ShelfId} owned by {OwnerId}", userId, request.ShelfId, shelf.UserId);
            return Result.Fail(Error.Forbidden("Shelves.Unauthorized", "You are not authorized to modify this shelf."));
        }

        var bookShelf = shelf.BookShelves.FirstOrDefault(bs => bs.BookId == request.BookId);
        if (bookShelf == null)
        {
            return Result.Fail(Error.NotFound(
                "Shelf.Notfound",
                $"Book:{request.BookId} not found in shelf:{shelf.Name}"));
        }

        shelf.BookShelves.Remove(bookShelf);

        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Book {BookId} removed from Shelf {ShelfId}", request.BookId, request.ShelfId);

        return Result.Ok();
    }
}

