using Goodreads.Application.AI.Queries.GetAiRecommendations;
using Goodreads.API.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Goodreads.API.Controllers;

[ApiController]
[Route("api/ai")]
public class AiController : BaseController
{
    /// <summary>
    /// Get AI-powered book recommendations based on user's reading history
    /// </summary>
    /// <param name="userQuery">Optional query to customize recommendations (e.g., "I want to read fantasy books")</param>
    /// <returns>List of book recommendations with title, author, and reason</returns>
    [HttpGet("recommendations")]
    [Authorize]
    [ProducesResponseType(typeof(List<Goodreads.Application.DTOs.AiBookRecommendationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetRecommendations([FromQuery] string? userQuery)
    {
        var query = new GetAiRecommendationsQuery(userQuery);
        var result = await Sender.Send(query);
        return Ok(result);
    }
}
