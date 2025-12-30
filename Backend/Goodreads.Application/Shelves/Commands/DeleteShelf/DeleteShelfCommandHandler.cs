namespace Goodreads.Application.Shelves.Commands.DeleteShelf;
internal class DeleteShelfCommandHandler : IRequestHandler<DeleteShelfCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DeleteShelfCommandHandler> _logger;
    private readonly IUserContext _userContext;

    public DeleteShelfCommandHandler(
        IUnitOfWork unitOfWork,
        ILogger<DeleteShelfCommandHandler> logger,
        IUserContext userContext)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _userContext = userContext;
    }

    public async Task<Result> Handle(DeleteShelfCommand request, CancellationToken cancellationToken)
    {
        var shelfId = request.ShelfId;
        _logger.LogInformation("Deleting shelf with ID: {ShelfId}", shelfId);

        var userId = _userContext.UserId;
        if (userId == null)
            return Result.Fail(AuthErrors.Unauthorized);

        var shelf = await _unitOfWork.Shelves.GetByIdAsync(shelfId);
        if (shelf == null)
        {
            _logger.LogWarning("Shelf with ID: {ShelfId} not found", shelfId);
            return Result.Fail(ShelfErrors.NotFound(shelfId));
        }

        // Check if user owns the shelf
        if (shelf.UserId != userId)
        {
            _logger.LogWarning("User {UserId} attempted to delete shelf {ShelfId} owned by {OwnerId}", userId, shelfId, shelf.UserId);
            return Result.Fail(Error.Forbidden("Shelves.Unauthorized", "You are not authorized to delete this shelf."));
        }

        if (shelf.IsDefault)
        {
            _logger.LogWarning("Attempt to delete default shelf: {ShelfName}", shelf.Name);
            return Result.Fail(Error.Failure("Shelves.DefaultShelfDeleteDenied", $"Cannot delete default shelf '{shelf.Name}'."));
        }

        shelf.IsDeleted = true;
        shelf.DeletedAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();

        return Result.Ok();
    }

}

