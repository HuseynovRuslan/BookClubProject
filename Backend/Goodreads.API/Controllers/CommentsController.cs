using Goodreads.API.Common;
using Goodreads.Application.Comments.Commands.DeleteComment;
using Goodreads.Application.Comments.Commands.CreateComment;
using Goodreads.Application.Comments.Commands.UpdateComment;
using Goodreads.Application.Comments.Queries.GetAllComments;
using Goodreads.Application.Comments.Queries.GetCommentById;
using Goodreads.Application.Common;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using Goodreads.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;

namespace Goodreads.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : BaseController
{
    [HttpGet("get-all-comments")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] QueryParameters parameters, [FromQuery] string? targetId = null)
    {
        var result = await Sender.Send(new GetAllCommentsQuery(parameters, targetId));
        return Ok(result);
    }

    [HttpGet("get-comment-by-id/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await Sender.Send(new GetCommentByIdQuery(id));
        return result.Match(
            comment => Ok(ApiResponse<CommentDto>.Success(comment)),
            failure => CustomResults.Problem(failure));
    }

    [HttpPost("create-comment")]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateCommentCommand command)
    {
        var result = await Sender.Send(command);
        return result.Match(
            id => CreatedAtAction(nameof(GetById), new { id }, ApiResponse<string>.Success(id)),
            failure => CustomResults.Problem(failure));
    }

    [HttpPut("update-comment/{id}")]
    [Authorize]
    public async Task<IActionResult> Update(string id, [FromBody] string text)
    {
        var result = await Sender.Send(new UpdateCommentCommand(id, text));
        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }

    [HttpDelete("delete-comment/{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(string id)
    {
        var result = await Sender.Send(new DeleteCommentCommand(id));
        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }
}
