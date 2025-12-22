using Goodreads.API.Common;
using Goodreads.Application.Common;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using Goodreads.Application.Feed.Queries.GetFeed;
using Goodreads.Application.Feed.Queries.GetSocialFeed;
using Goodreads.Application.Posts.Commands.UploadPostImage;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;

namespace Goodreads.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FeedController : BaseController
{
    [HttpGet("get-feed")]
    public async Task<IActionResult> GetFeed(int? pageNumber, int? pageSize)
    {
        var result = await Sender.Send(new GetFeedQuery(pageNumber, pageSize));
        return Ok(result);
    }

    [HttpGet("get-social-feed")]
    public async Task<IActionResult> GetSocialFeed(int? pageNumber, int? pageSize)
    {
        var result = await Sender.Send(new GetSocialFeedQuery(pageNumber, pageSize));
        return Ok(result);
    }

    [HttpPost("upload-post-image")]
    public async Task<IActionResult> UploadPostImage([FromForm] UploadPostImageCommand command)
    {
        var result = await Sender.Send(command);
        return result.Match(
            imageUrl => Ok(ApiResponse<string>.Success(imageUrl)),
            failure => CustomResults.Problem(failure));
    }
}

