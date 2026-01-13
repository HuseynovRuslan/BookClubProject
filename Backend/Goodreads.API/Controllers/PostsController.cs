using Goodreads.API.Common;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.Posts.Commands.ToggleSavePost;
using Goodreads.Application.Posts.Queries.GetSavedPosts;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;

namespace Goodreads.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PostsController : BaseController
{
    [HttpPost("toggle-save")]
    public async Task<IActionResult> ToggleSave(
        [FromBody] ToggleSavePostCommand command)
    {
        var result = await Sender.Send(command);

        return result.Match(
            isSaved => Ok(ApiResponse<bool>.Success(isSaved)),
            failure => CustomResults.Problem(failure)
        );
    }

    [HttpGet("get-saved-posts")]
    public async Task<IActionResult> GetSavedPosts(
        [FromQuery] QueryParameters parameters)
    {
        var result = await Sender.Send(new GetSavedPostsQuery(parameters));
        return Ok(result);
    }
}
