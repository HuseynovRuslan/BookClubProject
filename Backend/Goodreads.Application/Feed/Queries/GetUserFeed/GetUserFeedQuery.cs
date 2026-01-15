using Goodreads.Application.Common;
using Goodreads.Application.DTOs;

namespace Goodreads.Application.Feed.Queries.GetUserFeed;

public record GetUserFeedQuery(string TargetUserId, int? PageNumber = 1, int? PageSize = 10) 
    : IRequest<PagedResult<FeedItemDto>>;
