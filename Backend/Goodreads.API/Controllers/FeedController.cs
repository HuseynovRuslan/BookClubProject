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
public class FeedController : BaseController
{
    [HttpGet("get-feed")]


    public async Task<IActionResult> GetFeed(int? pageNumber, int? pageSize)
    {
        var result = await Sender.Send(new GetFeedQuery(pageNumber, pageSize));
        return Ok(result);
    }
}

