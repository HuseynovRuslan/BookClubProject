using Goodreads.API.Common;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using Goodreads.Application.Messages.Commands.DeleteMessage;
using Goodreads.Application.Messages.Commands.DeleteConversation;
using Goodreads.Application.Messages.Commands.EditMessage;
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
    private readonly ILogger<MessagesController> _logger;

    public MessagesController(ILogger<MessagesController> logger)
    {
        _logger = logger;
    }

    [HttpPost("send-message")]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageCommand command)
    {
        try
        {
            _logger.LogInformation("SendMessage called with ReceiverId: {ReceiverId}, Text length: {TextLength}", 
                command?.ReceiverId ?? "null", 
                command?.Text?.Length ?? 0);

            if (command == null)
            {
                _logger.LogError("SendMessageCommand is null");
                return BadRequest("Invalid request body");
            }

            var result = await Sender.Send(command);
            return result.Match(
                message => Ok(ApiResponse<MessageDto>.Success(message, "Message sent successfully")),
                failure => CustomResults.Problem(failure));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in SendMessage: {Message}", ex.Message);
            throw;
        }
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

    [HttpPut("edit-message/{messageId}")]
    public async Task<IActionResult> EditMessage(string messageId, [FromBody] EditMessageRequest request)
    {
        var result = await Sender.Send(new EditMessageCommand(messageId, request.Text));
        return result.Match(
            message => Ok(ApiResponse<MessageDto>.Success(message, "Message updated successfully")),
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

    [HttpDelete("delete-conversation/{conversationId}")]
    public async Task<IActionResult> DeleteConversation(string conversationId)
    {
        var result = await Sender.Send(new DeleteConversationCommand(conversationId));
        return result.Match(
            success => Ok(ApiResponse<bool>.Success(success)),
            failure => CustomResults.Problem(failure));
    }

    public record EditMessageRequest(string Text);
}
