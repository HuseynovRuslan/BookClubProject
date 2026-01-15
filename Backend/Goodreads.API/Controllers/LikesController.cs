using Goodreads.API.Common;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.Likes.Commands.ToggleLike;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;

namespace Goodreads.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LikesController : BaseController
{
    /// <summary>
    /// Toggle like for an entity (Quote, Review, or BookShelf)
    /// </summary>
    /// <param name="request">The entity ID and type to like/unlike</param>
    /// <returns>Whether the entity is now liked and the new like count</returns>
    [HttpPost("toggle")]
    [Authorize]
    public async Task<IActionResult> ToggleLike([FromBody] ToggleLikeRequest request)
    {
        var command = new ToggleLikeCommand(request.EntityId, request.EntityType);
        var result = await Sender.Send(command);
        
        return result.Match(
            response => Ok(ApiResponse<ToggleLikeResponse>.Success(response)),
            failure => CustomResults.Problem(failure));
    }
}

/// <summary>
/// Request model for toggling likes
/// </summary>
public record ToggleLikeRequest(string EntityId, string EntityType);
