namespace Goodreads.Application.Reviews.Commands.UpdateReview;
public record UpdateReviewCommand(string ReviewId, int? Rating, string? ReviewText)
    : IRequest<Result>;

public record UpdateReviewRequest(int? Rating, string? ReviewText);

