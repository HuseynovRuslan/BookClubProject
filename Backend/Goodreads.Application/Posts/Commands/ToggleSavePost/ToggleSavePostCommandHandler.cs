using Goodreads.Application.Common.Interfaces;
using Goodreads.Domain.Entities;
using Goodreads.Domain.Errors;
using MediatR;
using SharedKernel;

namespace Goodreads.Application.Posts.Commands.ToggleSavePost;

public class ToggleSavePostCommandHandler
    : IRequestHandler<ToggleSavePostCommand, Result<bool>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly ILogger<ToggleSavePostCommandHandler> _logger;

    public ToggleSavePostCommandHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        ILogger<ToggleSavePostCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(
        ToggleSavePostCommand request,
        CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;

        if (userId == null)
            return Result<bool>.Fail(AuthErrors.Unauthorized);

        // Post-un mövcudluğunu yoxla
        if (request.PostType == "Quote")
        {
            var quote = await _unitOfWork.Quotes.GetByIdAsync(request.PostId);
            if (quote == null)
                return Result<bool>.Fail(QuoteErrors.NotFound(request.PostId));
        }
        else if (request.PostType == "Review")
        {
            var review = await _unitOfWork.BookReviews.GetByIdAsync(request.PostId);
            if (review == null)
                return Result<bool>.Fail(BookReviewErrors.NotFound(request.PostId));
        }

        // Əvvəldən save olunubmu?
        var existingSave = await _unitOfWork.SavedPosts.GetSingleOrDefaultAsync(
            sp => sp.UserId == userId &&
                  sp.PostId == request.PostId &&
                  sp.PostType == request.PostType
        );

        if (existingSave != null)
        {
            // Unsave
            _unitOfWork.SavedPosts.Delete(existingSave);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation(
                "User {UserId} unsaved {PostType} {PostId}",
                userId, request.PostType, request.PostId);

            return Result<bool>.Ok(false);
        }

        // Save
        var newSave = new SavedPost
        {
            PostId = request.PostId,
            PostType = request.PostType,
            UserId = userId
        };

        await _unitOfWork.SavedPosts.AddAsync(newSave);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} saved {PostType} {PostId}",
            userId, request.PostType, request.PostId);

        return Result<bool>.Ok(true);
    }
}
