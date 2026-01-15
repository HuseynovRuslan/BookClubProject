using Goodreads.Application.Common.Interfaces;
using Goodreads.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goodreads.Application.Likes.Commands.ToggleLike;

public class ToggleLikeCommandHandler : IRequestHandler<ToggleLikeCommand, Result<ToggleLikeResponse>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly ILogger<ToggleLikeCommandHandler> _logger;
    private readonly IApplicationDbContext _context;

    // Supported entity types
    private static readonly HashSet<string> SupportedEntityTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "Quote",
        "Review",
        "BookShelf"
    };

    public ToggleLikeCommandHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        ILogger<ToggleLikeCommandHandler> logger,
        IApplicationDbContext context)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _logger = logger;
        _context = context;
    }

    public async Task<Result<ToggleLikeResponse>> Handle(ToggleLikeCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            return Result<ToggleLikeResponse>.Fail(AuthErrors.Unauthorized);

        // Validate entity type
        if (!SupportedEntityTypes.Contains(request.EntityType))
            return Result<ToggleLikeResponse>.Fail(Error.Validation("Like.InvalidEntityType", 
                $"Entity type '{request.EntityType}' is not supported. Supported types: Quote, Review, BookShelf"));

        // Validate entity exists
        var entityExists = await ValidateEntityExistsAsync(request.EntityId, request.EntityType);
        if (!entityExists)
            return Result<ToggleLikeResponse>.Fail(Error.NotFound("Like.EntityNotFound", 
                $"{request.EntityType} with ID '{request.EntityId}' not found"));

        // Handle Quote likes separately using QuoteLikes repository
        if (request.EntityType.Equals("Quote", StringComparison.OrdinalIgnoreCase))
        {
            return await HandleQuoteLikeAsync(request.EntityId, userId);
        }

        // Handle BookShelf likes using BookShelfLikes repository
        if (request.EntityType.Equals("BookShelf", StringComparison.OrdinalIgnoreCase))
        {
            return await HandleBookShelfLikeAsync(request.EntityId, userId);
        }

        // Handle Review entity type using Likes repository
        // Check if like already exists
        var existingLike = await _unitOfWork.Likes
            .GetSingleOrDefaultAsync(filter: l => 
                l.TargetId == request.EntityId && 
                l.TargetType == request.EntityType && 
                l.UserId == userId);

        bool isLiked;
        if (existingLike != null)
        {
            // Unlike - delete the existing like
            _unitOfWork.Likes.Delete(existingLike);
            await _unitOfWork.SaveChangesAsync();
            isLiked = false;
            _logger.LogInformation("User {UserId} unliked {EntityType} {EntityId}", userId, request.EntityType, request.EntityId);
        }
        else
        {
            // Like - create new like
            var newLike = new Like
            {
                TargetId = request.EntityId,
                TargetType = request.EntityType,
                UserId = userId
            };
            await _unitOfWork.Likes.AddAsync(newLike);
            await _unitOfWork.SaveChangesAsync();
            isLiked = true;
            _logger.LogInformation("User {UserId} liked {EntityType} {EntityId}", userId, request.EntityType, request.EntityId);
        }

        // Get new count
        var newCount = await _unitOfWork.Likes
            .CountAsync(l => l.TargetId == request.EntityId && l.TargetType == request.EntityType);

        return Result<ToggleLikeResponse>.Ok(new ToggleLikeResponse(isLiked, newCount));
    }

    private async Task<Result<ToggleLikeResponse>> HandleQuoteLikeAsync(string quoteId, string userId)
    {
        // Check if quote like already exists
        var existingQuoteLike = await _unitOfWork.QuoteLikes
            .GetSingleOrDefaultAsync(filter: ql => ql.QuoteId == quoteId && ql.UserId == userId);

        bool isLiked;
        if (existingQuoteLike != null)
        {
            // Unlike - delete the existing quote like
            _unitOfWork.QuoteLikes.Delete(existingQuoteLike);
            await _unitOfWork.SaveChangesAsync();
            isLiked = false;
            _logger.LogInformation("User {UserId} unliked Quote {QuoteId}", userId, quoteId);
        }
        else
        {
            // Like - create new quote like
            var newQuoteLike = new QuoteLike
            {
                QuoteId = quoteId,
                UserId = userId
            };
            await _unitOfWork.QuoteLikes.AddAsync(newQuoteLike);
            await _unitOfWork.SaveChangesAsync();
            isLiked = true;
            _logger.LogInformation("User {UserId} liked Quote {QuoteId}", userId, quoteId);
        }

        // Get new count from QuoteLikes
        var newCount = await _unitOfWork.QuoteLikes
            .CountAsync(ql => ql.QuoteId == quoteId);

        return Result<ToggleLikeResponse>.Ok(new ToggleLikeResponse(isLiked, newCount));
    }

    private async Task<Result<ToggleLikeResponse>> HandleBookShelfLikeAsync(string entityId, string userId)
    {
        // Parse BookShelf ID format: "BookId-ShelfId" (two 36-character GUIDs separated by hyphen)
        // Expected length: 36 + 1 + 36 = 73 characters
        if (entityId.Length < 73)
        {
            return Result<ToggleLikeResponse>.Fail(Error.Validation("Like.InvalidEntityId", 
                "BookShelf entityId must be in format 'BookId-ShelfId' (73 characters)"));
        }
        
        // Extract GUIDs using fixed positions (avoid Split which breaks on GUID's internal hyphens)
        var bookId = entityId.Substring(0, 36).ToLowerInvariant();
        var shelfId = entityId.Substring(37).ToLowerInvariant(); // Skip separator hyphen at index 36

        // Check if like already exists
        var existingLike = await _unitOfWork.BookShelfLikes
            .GetSingleOrDefaultAsync(filter: bsl => 
                bsl.BookId == bookId && 
                bsl.ShelfId == shelfId && 
                bsl.UserId == userId);

        bool isLiked;
        if (existingLike != null)
        {
            // Unlike - delete the existing like
            _unitOfWork.BookShelfLikes.Delete(existingLike);
            await _unitOfWork.SaveChangesAsync();
            isLiked = false;
            _logger.LogInformation("User {UserId} unliked BookShelf {BookId}-{ShelfId}", userId, bookId, shelfId);
        }
        else
        {
            // Like - create new BookShelfLike
            var newLike = new BookShelfLike
            {
                BookId = bookId,
                ShelfId = shelfId,
                UserId = userId
            };
            await _unitOfWork.BookShelfLikes.AddAsync(newLike);
            await _unitOfWork.SaveChangesAsync();
            isLiked = true;
            _logger.LogInformation("User {UserId} liked BookShelf {BookId}-{ShelfId}", userId, bookId, shelfId);
        }

        // Get new count from BookShelfLikes
        var newCount = await _unitOfWork.BookShelfLikes
            .CountAsync(bsl => bsl.BookId == bookId && bsl.ShelfId == shelfId);

        return Result<ToggleLikeResponse>.Ok(new ToggleLikeResponse(isLiked, newCount));
    }

    private async Task<bool> ValidateEntityExistsAsync(string entityId, string entityType)
    {
        return entityType.ToLowerInvariant() switch
        {
            "quote" => await _unitOfWork.Quotes.GetByIdAsync(entityId) != null,
            "review" => await _unitOfWork.BookReviews.GetByIdAsync(entityId) != null,
            "bookshelf" => await ValidateBookShelfExistsAsync(entityId),
            _ => false
        };
    }

    private async Task<bool> ValidateBookShelfExistsAsync(string entityId)
    {
        _logger.LogWarning("ValidateBookShelfExistsAsync - Incoming entityId: {EntityId}", entityId);
        
        // BookShelf ID format is "BookId-ShelfId" (two 36-character GUIDs separated by hyphen)
        // Expected length: 36 + 1 + 36 = 73 characters
        if (entityId.Length >= 73)
        {
            // Extract GUIDs using fixed positions (avoid Split which breaks on GUID's internal hyphens)
            var bookId = entityId.Substring(0, 36).ToLowerInvariant();
            var shelfId = entityId.Substring(37).ToLowerInvariant(); // Skip separator hyphen at index 36
            
            _logger.LogWarning("ValidateBookShelfExistsAsync - Parsed bookId: {BookId}, shelfId: {ShelfId}", bookId, shelfId);
            
            // Use IgnoreQueryFilters to include soft-deleted items (visible in feed but marked as deleted)
            var exists = await _context.BookShelves
                .IgnoreQueryFilters()
                .AnyAsync(bs => bs.BookId.ToLower() == bookId && bs.ShelfId.ToLower() == shelfId);
            
            if (!exists)
            {
                _logger.LogWarning("BookShelf item not found for BookId: {BookId}, ShelfId: {ShelfId}", bookId, shelfId);
            }
            
            return exists;
        }
        
        _logger.LogWarning("ValidateBookShelfExistsAsync - Invalid entityId format (expected 'BookId-ShelfId'): {EntityId}", entityId);
        
        // Fallback: try to match by BookId or ShelfId (for backward compatibility)
        var fallbackExists = await _context.BookShelves
            .IgnoreQueryFilters()
            .AnyAsync(bs => bs.BookId.ToLower() == entityId.ToLowerInvariant() || bs.ShelfId.ToLower() == entityId.ToLowerInvariant());
        
        if (!fallbackExists)
        {
            _logger.LogWarning("BookShelf item not found for fallback entityId: {EntityId}", entityId);
        }
        
        return fallbackExists;
    }
}
