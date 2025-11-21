using Goodreads.API.Common;
using Goodreads.Application.Common;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using Goodreads.Application.Feed.Queries.GetFeed;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Goodreads.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FeedController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [EndpointSummary("Get social feed")]
    [ProducesResponseType(typeof(PagedResult<FeedItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFeed(int? pageNumber, int? pageSize)
    {
        var result = await mediator.Send(new GetFeedQuery(pageNumber, pageSize));
        return Ok(result);
    }
}

