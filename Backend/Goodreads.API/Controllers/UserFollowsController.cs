using Goodreads.API.Common;
using Goodreads.Application.Common;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using Goodreads.Application.UserFollows.Commands.FollowUser;
using Goodreads.Application.UserFollows.Commands.UnfollowUser;
using Goodreads.Application.UserFollows.Queries.GetFollowers;
using Goodreads.Application.UserFollows.Queries.GetFollowing;
using Goodreads.Application.UserFollows.Queries.GetUserFollowers;
using Goodreads.Application.UserFollows.Queries.GetUserFollowing;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;
namespace Goodreads.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserFollowsController : BaseController
{
    [HttpPost("follow")]
    [Authorize]


    public async Task<IActionResult> Follow([FromBody] FollowUserCommand command)
    {
        var result = await Sender.Send(command);

        return result.Match(
            () => Ok(ApiResponse.Success("User followed successfully.")),
            failure => CustomResults.Problem(failure));
    }

    [HttpPost("unfollow")]
    [Authorize]


    public async Task<IActionResult> Unfollow([FromBody] UnfollowUserCommand command)
    {
        var result = await Sender.Send(command);

        return result.Match(
            () => Ok(ApiResponse.Success("User unfollowed successfully.")),
            failure => CustomResults.Problem(failure));
    }

    [HttpGet("followers")]
    [Authorize]


    public async Task<IActionResult> GetFollowers(int? pageNumber, int? pageSize)
    {
        var result = await Sender.Send(new GetFollowersQuery(pageNumber, pageSize));

        return result.Match(
            followers => Ok(followers),
            failure => CustomResults.Problem(failure));
    }

    [HttpGet("following")]
    [Authorize]


    public async Task<IActionResult> GetFollowing(int? pageNumber, int? pageSize)
    {
        var result = await Sender.Send(new GetFollowingQuery(pageNumber, pageSize));

        return result.Match(
          following => Ok(following),
          failure => CustomResults.Problem(failure));
    }

    [HttpGet("followers/{userId}")]
    [Authorize]
    public async Task<IActionResult> GetUserFollowers(string userId, int? pageNumber, int? pageSize)
    {
        var result = await Sender.Send(new GetUserFollowersQuery(userId, pageNumber, pageSize));

        return result.Match(
            followers => Ok(followers),
            failure => CustomResults.Problem(failure));
    }

    [HttpGet("following/{userId}")]
    [Authorize]
    public async Task<IActionResult> GetUserFollowing(string userId, int? pageNumber, int? pageSize)
    {
        var result = await Sender.Send(new GetUserFollowingQuery(userId, pageNumber, pageSize));

        return result.Match(
            following => Ok(following),
            failure => CustomResults.Problem(failure));
    }

}

