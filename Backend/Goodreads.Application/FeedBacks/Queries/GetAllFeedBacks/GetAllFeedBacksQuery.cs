namespace Goodreads.Application.FeedBacks.Queries.GetAllFeedBacks;

public record GetAllFeedBacksQuery(QueryParameters Parameters) : IRequest<PagedResult<FeedBackDto>>;
