using Goodreads.Application.DTOs;
using MediatR;

namespace Goodreads.Application.AI.Queries.GetAiRecommendations;

public record GetAiRecommendationsQuery(string? UserQuery) : IRequest<List<AiBookRecommendationDto>>;
