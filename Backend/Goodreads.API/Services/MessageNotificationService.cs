using Goodreads.Application.Common.Interfaces;
using Goodreads.Application.DTOs;
using Microsoft.AspNetCore.SignalR;

namespace Goodreads.API.Services;
public class MessageNotificationService : IMessageNotificationService
{
    private readonly IHubContext<Hubs.MessagesHub> _hubContext;
    private readonly ILogger<MessageNotificationService> _logger;

    public MessageNotificationService(
        IHubContext<Hubs.MessagesHub> hubContext,
        ILogger<MessageNotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task SendMessageToUserAsync(string userId, MessageDto message)
    {
        try
        {
            await _hubContext.Clients.User(userId).SendAsync("ReceiveMessage", message);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send SignalR notification to user {UserId} for message {MessageId}", userId, message.Id);
        }
    }

    public async Task SendMessageToGroupAsync(string groupName, MessageDto message)
    {
        try
        {
            await _hubContext.Clients.Group(groupName).SendAsync("NewMessage", message);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send SignalR notification to group {GroupName} for message {MessageId}", groupName, message.Id);
        }
    }

    public async Task NotifyMessageReadAsync(string userId, string messageId, DateTime readAt)
    {
        try
        {
            await _hubContext.Clients.User(userId).SendAsync("MessageRead", new
            {
                MessageId = messageId,
                ReadAt = readAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send SignalR notification for message read {MessageId} to user {UserId}", messageId, userId);
        }
    }
}
