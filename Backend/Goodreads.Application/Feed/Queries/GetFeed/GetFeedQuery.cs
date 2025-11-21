namespace Goodreads.Application.Feed.Queries.GetFeed;
public record GetFeedQuery(int? PageNumber, int? PageSize) : IRequest<PagedResult<FeedItemDto>>;


