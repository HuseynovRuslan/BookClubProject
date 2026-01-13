using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using MediatR;

namespace Goodreads.Application.Posts.Queries.GetSavedPosts;

public record GetSavedPostsQuery(QueryParameters Parameters)
    : IRequest<PagedResult<SavedPostDto>>;
