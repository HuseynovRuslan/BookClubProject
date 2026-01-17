using Goodreads.Application.Common.Interfaces;
using Goodreads.Application.DTOs;
using Microsoft.AspNetCore.SignalR;


namespace Goodreads.API.Services;

public class NotificationService : INotificationService
{
    private readonly IHubContext<Hubs.NotificationsHub> _hubContext;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        IHubContext<Hubs.NotificationsHub> hubContext,
        ILogger<NotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task SendNotificationToUserAsync(string userId, NotificationDto notification)
    {
        try
        {
            await _hubContext.Clients.User(userId).SendAsync("ReceiveNotification", notification);
            _logger.LogInformation("Sent notification {NotificationId} to user {UserId}", notification.Id, userId);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send SignalR notification to user {UserId} for notification {NotificationId}", userId, notification.Id);
        }
    }

    public async Task NotifyUnreadCountUpdatedAsync(string userId, int unreadCount)
    {
        try
        {
            await _hubContext.Clients.User(userId).SendAsync("UnreadCountUpdated", unreadCount);
            _logger.LogInformation("Updated unread count for user {UserId}: {Count}", userId, unreadCount);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send unread count update to user {UserId}", userId);
        }
    }
}
