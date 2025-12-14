namespace Goodreads.Application.Books.Commands.UpdateBookStatus;

public class UpdateBookStatusCommandHandler : IRequestHandler<UpdateBookStatusCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly ILogger<UpdateBookStatusCommandHandler> _logger;

    public UpdateBookStatusCommandHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        ILogger<UpdateBookStatusCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _logger = logger;
    }
    public async Task<Result> Handle(UpdateBookStatusCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;

        if (string.IsNullOrEmpty(userId))
            return Result.Fail(AuthErrors.Unauthorized);

        var (statusShelves, count) = await _unitOfWork.Shelves.GetAllAsync(
            filter: s => s.UserId == userId && s.IsDefault,
            includes: new[] { "BookShelves" });

        // Əgər default shelf-lər yoxdursa, onları yaradırıq
        if (count == 0)
        {
            var defaultShelfs = DefaultShelves.All.Select(shelf => new Shelf
            {
                Name = shelf,
                UserId = userId,
                IsDefault = true
            }).ToList();
            await _unitOfWork.Shelves.AddRangeAsync(defaultShelfs);
            await _unitOfWork.SaveChangesAsync();
            
            // Yenidən yükləyirik
            var (reloadedShelves, _) = await _unitOfWork.Shelves.GetAllAsync(
                filter: s => s.UserId == userId && s.IsDefault,
                includes: new[] { "BookShelves" });
            statusShelves = reloadedShelves;
        }

        foreach (var shelf in statusShelves)
        {
            var existing = shelf.BookShelves.FirstOrDefault(bs => bs.BookId == request.BookId);
            if (existing != null)
                shelf.BookShelves.Remove(existing);
        }

        if (string.IsNullOrWhiteSpace(request.TargetShelfName))
        {
            await _unitOfWork.SaveChangesAsync();
            _logger.LogInformation("Book {BookId} removed from all default shelves", request.BookId);
            return Result.Ok();
        }

        var targetShelf = statusShelves.FirstOrDefault(s => s.Name == request.TargetShelfName);
        if (targetShelf == null)
        {
            _logger.LogWarning("Default shelf not found: {ShelfName}", request.TargetShelfName);
            return Result.Fail(Error.NotFound("Shelves.DefaultShelfNotFound", $"Default shelf '{request.TargetShelfName}' not found."));
        }

        targetShelf.BookShelves.Add(new BookShelf
        {
            BookId = request.BookId,
            ShelfId = targetShelf.Id,
            AddedAt = DateTime.UtcNow
        });

        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Book {BookId} updated to status {ShelfName}", request.BookId, request.TargetShelfName);

        return Result.Ok();
    }

}