namespace Goodreads.Application.Reviews.Commands.CreateBookReview;
public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;

    public CreateReviewCommandHandler(IUnitOfWork unitOfWork, IUserContext userContext)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
    }

    public async Task<Result<string>> Handle(CreateReviewCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (string.IsNullOrEmpty(userId))
            return Result<string>.Fail(AuthErrors.Unauthorized);

        var book = await _unitOfWork.Books.GetByIdAsync(request.BookId);
        if (book is null)
            return Result<string>.Fail(BookErrors.NotFound(request.BookId));

        
        var existingReview = await _unitOfWork.BookReviews.GetSingleOrDefaultAsync(
            r => r.BookId == request.BookId && r.UserId == userId);

        if (existingReview != null)
            return Result<string>.Fail(BookReviewErrors.AlreadyReviewed(request.BookId));

        var review = new BookReview
        {
            BookId = request.BookId,
            UserId = userId,
            Rating = request.Rating,
            ReviewText = request.ReviewText
        };

        await _unitOfWork.BookReviews.AddAsync(review);

      
        var (allReviews, _) = await _unitOfWork.BookReviews.GetAllAsync(
            r => r.BookId == request.BookId);
        var reviewsList = allReviews.ToList();
        reviewsList.Add(review); 
        
        if (reviewsList.Any())
        {
            book.AverageRating = reviewsList.Average(r => r.Rating);
            book.RatingCount = reviewsList.Count;
            _unitOfWork.Books.Update(book);
        }
        await _unitOfWork.SaveChangesAsync();

        return Result<string>.Ok(review.Id);
    }

}
