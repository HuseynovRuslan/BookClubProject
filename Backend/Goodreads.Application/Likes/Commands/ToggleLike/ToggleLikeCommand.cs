namespace Goodreads.Application.Likes.Commands.ToggleLike;

public record ToggleLikeCommand(string EntityId, string EntityType) : IRequest<Result<ToggleLikeResponse>>;

public record ToggleLikeResponse(bool IsLiked, int NewCount);
