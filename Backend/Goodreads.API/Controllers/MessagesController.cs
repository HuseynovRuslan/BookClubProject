using Goodreads.API.Common;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using Goodreads.Application.Messages.Commands.DeleteMessage;
using Goodreads.Application.Messages.Commands.MarkAsRead;
using Goodreads.Application.Messages.Commands.SendMessage;
using Goodreads.Application.Messages.Queries.GetConversations;
using Goodreads.Application.Messages.Queries.GetMessages;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;

namespace Goodreads.API.Controllers;
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : BaseController
{
    [HttpPost("send-message")]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageCommand command)
    {
        var result = await Sender.Send(command);
        return result.Match(
            message => Ok(ApiResponse<MessageDto>.Success(message, "Message sent successfully")),
            failure => CustomResults.Problem(failure));
    }

    [HttpGet("get-conversations")]
    public async Task<IActionResult> GetConversations([FromQuery] QueryParameters parameters)
    {
        var result = await Sender.Send(new GetConversationsQuery(parameters));
        return Ok(result);
    }

    [HttpGet("get-messages/{otherUserId}")]
    public async Task<IActionResult> GetMessages(string otherUserId, [FromQuery] QueryParameters parameters)
    {
        var result = await Sender.Send(new GetMessagesQuery(otherUserId, parameters));
        return Ok(result);
    }

    [HttpPost("mark-as-read/{messageId}")]
    public async Task<IActionResult> MarkAsRead(string messageId)
    {
        var result = await Sender.Send(new MarkAsReadCommand(messageId));
        return result.Match(
            success => Ok(ApiResponse<bool>.Success(success)),
            failure => CustomResults.Problem(failure));
    }

    [HttpDelete("delete-message/{messageId}")]
    public async Task<IActionResult> DeleteMessage(string messageId)
    {
        var result = await Sender.Send(new DeleteMessageCommand(messageId));
        return result.Match(
            success => Ok(ApiResponse<bool>.Success(success)),
            failure => CustomResults.Problem(failure));
    }
}
