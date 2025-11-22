namespace Goodreads.Application.Reviews.Commands.UpdateReview;
public class UpdateReviewCommandHandler : IRequestHandler<UpdateReviewCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly ILogger<UpdateReviewCommandHandler> _logger;

    public UpdateReviewCommandHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        ILogger<UpdateReviewCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _logger = logger;
    }

    public async Task<Result> Handle(UpdateReviewCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (string.IsNullOrEmpty(userId))
            return Result.Fail(AuthErrors.Unauthorized);

        var review = await _unitOfWork.BookReviews.GetByIdAsync(request.ReviewId);

        if (review == null)
            return Result.Fail(BookReviewErrors.NotFound(request.ReviewId));

        // Check if user owns the review
        if (review.UserId != userId)
            return Result.Fail(BookReviewErrors.Unauthorized);

        // Update rating if provided
        if (request.Rating.HasValue)
        {
            review.Rating = request.Rating.Value;
        }

        // Update review text if provided
        if (request.ReviewText != null)
        {
            review.ReviewText = request.ReviewText;
        }

        _unitOfWork.BookReviews.Update(review);

        // Update book's average rating after review update
        var (allReviews, _) = await _unitOfWork.BookReviews.GetAllAsync(
            r => r.BookId == review.BookId);
        
        if (allReviews.Any())
        {
            var book = await _unitOfWork.Books.GetByIdAsync(review.BookId);
            if (book != null)
            {
                book.AverageRating = allReviews.Average(r => r.Rating);
                book.RatingCount = allReviews.Count();
                _unitOfWork.Books.Update(book);
            }
        }

        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("User {UserId} updated review {ReviewId}", userId, request.ReviewId);

        return Result.Ok();
    }
}

