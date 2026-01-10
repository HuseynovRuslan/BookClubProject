using AutoMapper;
using Goodreads.Application.DTOs;

namespace Goodreads.Application.Shelves.Commands.UpdateShelf;
internal class UpdateShelfCommandHandler : IRequestHandler<UpdateShelfCommand, Result<ShelfDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateShelfCommandHandler> _logger;
    private readonly IUserContext _userContext;
    private readonly IMapper _mapper;

    public UpdateShelfCommandHandler(
        IUnitOfWork unitOfWork,
        ILogger<UpdateShelfCommandHandler> logger,
        IUserContext userContext,
        IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _userContext = userContext;
        _mapper = mapper;
    }

    public async Task<Result<ShelfDto>> Handle(UpdateShelfCommand request, CancellationToken cancellationToken)
    {
        var shelfId = request.ShelfId;
        _logger.LogInformation("Updating shelf with ID: {ShelfId}", shelfId);

        var userId = _userContext.UserId;
        if (userId == null)
            return Result<ShelfDto>.Fail(AuthErrors.Unauthorized);

        var shelf = await _unitOfWork.Shelves.GetByIdAsync(shelfId);
        if (shelf == null)
        {
            _logger.LogWarning("Shelf with ID: {ShelfId} not found", shelfId);
            return Result<ShelfDto>.Fail(ShelfErrors.NotFound(shelfId));
        }

        // Check if user owns the shelf
        if (shelf.UserId != userId)
        {
            _logger.LogWarning("User {UserId} attempted to update shelf {ShelfId} owned by {OwnerId}", userId, shelfId, shelf.UserId);
            return Result<ShelfDto>.Fail(Error.Forbidden("Shelves.Unauthorized", "You are not authorized to update this shelf."));
        }

        // Check if shelf is default (cannot update default shelves)
        if (shelf.IsDefault)
        {
            _logger.LogWarning("Attempt to update default shelf: {ShelfName}", shelf.Name);
            return Result<ShelfDto>.Fail(Error.Failure("Shelves.DefaultShelfUpdateDenied", $"Cannot update default shelf '{shelf.Name}'."));
        }

        shelf.Name = request.Name.Trim();

        _unitOfWork.Shelves.Update(shelf);
        await _unitOfWork.SaveChangesAsync();

        var shelfDto = _mapper.Map<ShelfDto>(shelf);
        _logger.LogInformation("Shelf with ID: {ShelfId} updated successfully", shelfId);
        return Result<ShelfDto>.Ok(shelfDto);
    }
}

