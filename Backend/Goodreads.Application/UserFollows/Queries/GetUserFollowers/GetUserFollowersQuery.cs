using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using MediatR;
using SharedKernel;

namespace Goodreads.Application.UserFollows.Queries.GetUserFollowers;

public record GetUserFollowersQuery(string UserId, int? PageNumber, int? PageSize) : IRequest<Result<PagedResult<UserDto>>>;

