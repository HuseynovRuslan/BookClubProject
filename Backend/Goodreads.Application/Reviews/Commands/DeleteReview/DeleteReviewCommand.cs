namespace Goodreads.Application.Reviews.Commands.DeleteReview;
public record DeleteReviewCommand(string ReviewId) : IRequest<Result>;

