using Goodreads.API.Common;
using Goodreads.Application.Common;
using Goodreads.Application.Common.Interfaces;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using Goodreads.Application.Quotes.Commands.CreateQuote;
using Goodreads.Application.Quotes.Commands.DeleteQuote;
using Goodreads.Application.Quotes.Commands.ToggleQuoteLike;
using Goodreads.Application.Quotes.Commands.UpdateQuote;
using Goodreads.Application.Quotes.Queries.GetAllQuotes;
using Goodreads.Application.Quotes.Queries.GetQuoteById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;

namespace Goodreads.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuotesController(IUserContext userContext) : BaseController
{
    [HttpGet("get-all-quotes")]


    public async Task<IActionResult> GetAllQuotes([FromQuery] QueryParameters parameters, string? Tag, string? UserId, string? AuthorId, string? BookId)
    {
        var result = await Sender.Send(new GetAllQuotesQuery(parameters, Tag, UserId, AuthorId, BookId));
        return Ok(result);
    }

    [HttpGet("get-my-quotes")]

    [Authorize]

    public async Task<IActionResult> GetMyQuotes([FromQuery] QueryParameters parameters, string? Tag, string? AuthorId, string? BookId)
    {
        var userId = userContext.UserId;
        if (userId == null)
            return Unauthorized();

        var result = await Sender.Send(new GetAllQuotesQuery(parameters, Tag, userId, AuthorId, BookId));

        return Ok(result);
    }


    [HttpGet("get-quote-by-id/{id}")]


    public async Task<IActionResult> GetQuoteById(string id)
    {
        var result = await Sender.Send(new GetQuoteByIdQuery(id));
        return result.Match(
            quote => Ok(ApiResponse<QuoteDto>.Success(quote)),
            failure => CustomResults.Problem(failure));
    }

    [HttpPost("create-quote")]
    [Authorize]


    public async Task<IActionResult> CreateQuote([FromBody] CreateQuoteCommand command)
    {
        var result = await Sender.Send(command);
        return result.Match(
            id => CreatedAtAction(nameof(GetQuoteById), new { id }, ApiResponse.Success("Quote created successfully")),
            failure => CustomResults.Problem(failure));

    }

    [HttpPost("toggle-quote-like/{id}")]
    [Authorize]


    public async Task<IActionResult> ToggleLike(string id)
    {
        var result = await Sender.Send(new ToggleQuoteLikeCommand(id));
        return result.Match(
            liked => Ok(ApiResponse<bool>.Success(liked)),
            failure => CustomResults.Problem(failure));
    }


    [HttpPut("update-quote/{id}")]
    [Authorize]


    public async Task<IActionResult> Update([FromRoute] string id, [FromBody] UpdateQuoteRequest request)
    {
        var command = new UpdateQuoteCommand(id, request.Text, request.Tags);
        var result = await Sender.Send(command);

        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }

    [HttpDelete("delete-quote/{id}")]
    [Authorize]


    public async Task<IActionResult> Delete(string id)
    {
        var result = await Sender.Send(new DeleteQuoteCommand(id));
        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }


}

