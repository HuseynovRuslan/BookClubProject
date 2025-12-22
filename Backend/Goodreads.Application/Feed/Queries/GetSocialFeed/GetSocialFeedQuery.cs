namespace Goodreads.Application.Feed.Queries.GetSocialFeed;
public record GetSocialFeedQuery(int? PageNumber, int? PageSize) : IRequest<PagedResult<FeedItemDto>>;

