namespace Goodreads.Application.Shelves.Commands.UpdateShelf;
internal class UpdateShelfCommandHandler : IRequestHandler<UpdateShelfCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateShelfCommandHandler> _logger;
    private readonly IUserContext _userContext;

    public UpdateShelfCommandHandler(
        IUnitOfWork unitOfWork,
        ILogger<UpdateShelfCommandHandler> logger,
        IUserContext userContext)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _userContext = userContext;
    }

    public async Task<Result> Handle(UpdateShelfCommand request, CancellationToken cancellationToken)
    {
        var shelfId = request.ShelfId;
        _logger.LogInformation("Updating shelf with ID: {ShelfId}", shelfId);

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
            _logger.LogWarning("User {UserId} attempted to update shelf {ShelfId} owned by {OwnerId}", userId, shelfId, shelf.UserId);
            return Result.Fail(Error.Forbidden("Shelves.Unauthorized", "You are not authorized to update this shelf."));
        }

        shelf.Name = request.Name;

        _unitOfWork.Shelves.Update(shelf);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Shelf with ID: {ShelfId} updated successfully", shelfId);
        return Result.Ok();
    }
}

