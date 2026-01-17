using Goodreads.Application.Common.Interfaces;
using Goodreads.Application.Common.Interfaces.AI;
using Goodreads.Application.DTOs;
using Goodreads.Domain.Constants;
using MediatR;

namespace Goodreads.Application.AI.Queries.GetAiRecommendations;

public class GetAiRecommendationsQueryHandler : IRequestHandler<GetAiRecommendationsQuery, List<AiBookRecommendationDto>>
{
    private readonly IUserContext _userContext;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAiRecommendationService _aiRecommendationService;
    private readonly ILogger<GetAiRecommendationsQueryHandler> _logger;

    public GetAiRecommendationsQueryHandler(
        IUserContext userContext,
        IUnitOfWork unitOfWork,
        IAiRecommendationService aiRecommendationService,
        ILogger<GetAiRecommendationsQueryHandler> logger)
    {
        _userContext = userContext;
        _unitOfWork = unitOfWork;
        _aiRecommendationService = aiRecommendationService;
        _logger = logger;
    }

    public async Task<List<AiBookRecommendationDto>> Handle(GetAiRecommendationsQuery request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        List<AiBookRecommendationDto> recommendations;

        if (userId == null)
        {
            _logger.LogWarning("User is not authenticated, returning generic recommendations");
            recommendations = await _aiRecommendationService.GetRecommendationsAsync(new List<string>(), request.UserQuery);
        }
        else
        {
            var favoriteBookTitles = new List<string>();

            try
            {
               
                var (highRatedReviews, _) = await _unitOfWork.BookReviews.GetAllAsync(
                    filter: r => r.UserId == userId && r.Rating >= 4,
                    includes: new[] { "Book" }
                );

                var highRatedTitles = highRatedReviews
                    .Where(r => r.Book != null && !string.IsNullOrWhiteSpace(r.Book.Title))
                    .Select(r => r.Book!.Title)
                    .Distinct()
                    .ToList();

                favoriteBookTitles.AddRange(highRatedTitles);

              
                var readShelf = await _unitOfWork.Shelves.GetSingleOrDefaultAsync(
                    filter: s => s.UserId == userId && 
                                 s.IsDefault && 
                                 s.Name == DefaultShelves.Read && 
                                 !s.IsDeleted);

                if (readShelf != null)
                {
                    var (readBookShelves, _) = await _unitOfWork.BookShelves.GetAllAsync(
                        filter: bs => bs.ShelfId == readShelf.Id && 
                                      !bs.IsDeleted,
                        includes: new[] { "Book" }
                    );

                    var readBooks = readBookShelves
                        .Where(bs => bs.Book != null && 
                                     !bs.Book.IsDeleted &&
                                     !string.IsNullOrWhiteSpace(bs.Book.Title))
                        .Select(bs => bs.Book!.Title)
                        .Distinct()
                        .ToList();

                    favoriteBookTitles.AddRange(readBooks);
                }

                favoriteBookTitles = favoriteBookTitles.Distinct().ToList();

                _logger.LogInformation("Found {Count} favorite books for user {UserId}", favoriteBookTitles.Count, userId);

                recommendations = await _aiRecommendationService.GetRecommendationsAsync(favoriteBookTitles, request.UserQuery);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting AI recommendations for user {UserId}", userId);
                recommendations = await _aiRecommendationService.GetRecommendationsAsync(new List<string>(), request.UserQuery);
            }
        }

        recommendations = await CrossReferenceWithDatabaseAsync(recommendations);

        return recommendations
            .OrderByDescending(r => r.ExistsInDb)
            .ToList();
    }

    private async Task<List<AiBookRecommendationDto>> CrossReferenceWithDatabaseAsync(List<AiBookRecommendationDto> recommendations)
    {
        foreach (var recommendation in recommendations)
        {
            try
            {
                var matchingBook = await _unitOfWork.Books.GetSingleOrDefaultAsync(
                    filter: b => !b.IsDeleted && 
                                 b.Title.ToLower().Contains(recommendation.Title.ToLower()));

                if (matchingBook != null)
                {
                    recommendation.ExistsInDb = true;
                    recommendation.BookId = matchingBook.Id;
                    recommendation.CoverImage = matchingBook.CoverImageUrl;
                    _logger.LogDebug("Found matching book in DB: {Title} -> {BookId}", recommendation.Title, matchingBook.Id);
                }
                else
                {
                    recommendation.ExistsInDb = false;
                    recommendation.BookId = null;
                    recommendation.CoverImage = null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error checking database for book: {Title}", recommendation.Title);
                recommendation.ExistsInDb = false;
            }
        }

        return recommendations;
    }
}
