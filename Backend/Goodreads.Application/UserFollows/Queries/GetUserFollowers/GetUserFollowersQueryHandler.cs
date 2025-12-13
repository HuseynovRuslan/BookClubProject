using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using Goodreads.Domain.Entities;
using Goodreads.Domain.Errors;
using Microsoft.AspNetCore.Identity;
using SharedKernel;

namespace Goodreads.Application.UserFollows.Queries.GetUserFollowers;

internal class GetUserFollowersQueryHandler : IRequestHandler<GetUserFollowersQuery, Result<PagedResult<UserDto>>>
{
    private readonly IUserFollowRepository _userFollowRepository;
    private readonly UserManager<User> _userManager;
    private readonly IMapper _mapper;

    public GetUserFollowersQueryHandler(
        IUserFollowRepository userFollowRepository,
        UserManager<User> userManager,
        IMapper mapper)
    {
        _userFollowRepository = userFollowRepository;
        _userManager = userManager;
        _mapper = mapper;
    }

    public async Task<Result<PagedResult<UserDto>>> Handle(GetUserFollowersQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user is null)
            return Result<PagedResult<UserDto>>.Fail(FollowErrors.UserNotFound(request.UserId));

        var followers = await _userFollowRepository.GetFollowersAsync(request.UserId, request.PageNumber, request.PageSize);
        var totalCount = await _userFollowRepository.GetFollowersCountAsync(request.UserId);

        var dtoList = _mapper.Map<List<UserDto>>(followers);

        var pagedResult = PagedResult<UserDto>.Create(
            dtoList,
            request.PageNumber ?? 1,
            request.PageSize ?? totalCount,
            totalCount
        );

        return Result<PagedResult<UserDto>>.Ok(pagedResult);
    }
}

