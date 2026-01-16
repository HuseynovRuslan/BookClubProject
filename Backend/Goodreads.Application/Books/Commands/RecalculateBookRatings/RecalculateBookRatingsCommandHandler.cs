using Goodreads.Application.Common.Interfaces;
using Goodreads.Domain.Entities;
using SharedKernel;

namespace Goodreads.Application.Books.Commands.RecalculateBookRatings;
internal class RecalculateBookRatingsCommandHandler : IRequestHandler<RecalculateBookRatingsCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<RecalculateBookRatingsCommandHandler> _logger;

    public RecalculateBookRatingsCommandHandler(
        IUnitOfWork unitOfWork,
        ILogger<RecalculateBookRatingsCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<int>> Handle(RecalculateBookRatingsCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting to recalculate book ratings...");

        // Get all non-deleted books
        var (books, _) = await _unitOfWork.Books.GetAllAsync(
            filter: b => !b.IsDeleted,
            includes: new[] { "BookReviews" });

        int updatedCount = 0;

        foreach (var book in books)
        {
            // Get all non-deleted reviews for this book
            var reviews = book.BookReviews?.Where(r => !r.IsDeleted).ToList() ?? new List<BookReview>();

            if (reviews.Any())
            {
                book.AverageRating = reviews.Average(r => r.Rating);
                book.RatingCount = reviews.Count;
            }
            else
            {
                book.AverageRating = 0;
                book.RatingCount = 0;
            }

            _unitOfWork.Books.Update(book);
            updatedCount++;
        }

        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Recalculated ratings for {Count} books", updatedCount);
        return Result<int>.Ok(updatedCount);
    }
}
