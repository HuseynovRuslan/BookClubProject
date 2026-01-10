namespace Goodreads.Application.FeedBacks.Queries.GetFeedBackById;

public record GetFeedBackByIdQuery(string Id) : IRequest<Result<FeedBackDto>>;
