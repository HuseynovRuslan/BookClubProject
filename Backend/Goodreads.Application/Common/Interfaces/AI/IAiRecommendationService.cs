namespace Goodreads.Application.Common.Interfaces.AI;

public interface IAiRecommendationService
{
    Task<List<AiBookRecommendationDto>> GetRecommendationsAsync(List<string> userFavoriteBooks, string? userQuery);
}
