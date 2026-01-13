using Goodreads.API.Common;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using Goodreads.Application.Notifications.Commands.DeleteNotification;
using Goodreads.Application.Notifications.Commands.MarkAllAsRead;
using Goodreads.Application.Notifications.Commands.MarkAsRead;
using Goodreads.Application.Notifications.Queries.GetNotifications;
using Goodreads.Application.Notifications.Queries.GetUnreadCount;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;

namespace Goodreads.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] QueryParameters parameters)
    {
        var result = await Sender.Send(new GetNotificationsQuery(parameters));
        return Ok(result);
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var result = await Sender.Send(new GetUnreadCountQuery());
        return Ok(ApiResponse<int>.Success(result));
    }

    [HttpPost("{notificationId}/mark-as-read")]
    public async Task<IActionResult> MarkAsRead(string notificationId)
    {
        var result = await Sender.Send(new MarkAsReadCommand(notificationId));
        return result.Match(
            success => Ok(ApiResponse<bool>.Success(success)),
            failure => CustomResults.Problem(failure));
    }

    [HttpPost("mark-all-as-read")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var result = await Sender.Send(new MarkAllAsReadCommand());
        return result.Match(
            count => Ok(ApiResponse<int>.Success(count, $"{count} notifications marked as read")),
            failure => CustomResults.Problem(failure));
    }

    [HttpDelete("{notificationId}")]
    public async Task<IActionResult> DeleteNotification(string notificationId)
    {
        var result = await Sender.Send(new DeleteNotificationCommand(notificationId));
        return result.Match(
            success => Ok(ApiResponse<bool>.Success(success)),
            failure => CustomResults.Problem(failure));
    }
}
