namespace Goodreads.Application.Reviews.Commands.DeleteReview;
public class DeleteReviewCommandHandler : IRequestHandler<DeleteReviewCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly ILogger<DeleteReviewCommandHandler> _logger;

    public DeleteReviewCommandHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        ILogger<DeleteReviewCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteReviewCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (string.IsNullOrEmpty(userId))
            return Result.Fail(AuthErrors.Unauthorized);

        var review = await _unitOfWork.BookReviews.GetByIdAsync(request.ReviewId);
        if (review == null)
            return Result.Fail(BookReviewErrors.NotFound(request.ReviewId));

      
        if (review.UserId != userId)
            return Result.Fail(BookReviewErrors.Unauthorized);

       
        var book = await _unitOfWork.Books.GetByIdAsync(review.BookId);
        
        _unitOfWork.BookReviews.Delete(review);
        await _unitOfWork.SaveChangesAsync();

      
        if (book != null)
        {
            var (allReviews, _) = await _unitOfWork.BookReviews.GetAllAsync(
                r => r.BookId == review.BookId);
            
            if (allReviews.Any())
            {
                book.AverageRating = allReviews.Average(r => r.Rating);
                book.RatingCount = allReviews.Count();
            }
            else
            {
                
                book.AverageRating = 0;
                book.RatingCount = 0;
            }
            
            _unitOfWork.Books.Update(book);
            await _unitOfWork.SaveChangesAsync();
        }

        _logger.LogInformation("User {UserId} deleted review {ReviewId}", userId, request.ReviewId);

        return Result.Ok();
    }
}

