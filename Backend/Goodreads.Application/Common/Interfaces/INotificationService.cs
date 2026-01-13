using Goodreads.Application.DTOs;

namespace Goodreads.Application.Common.Interfaces;

public interface INotificationService
{
    Task SendNotificationToUserAsync(string userId, NotificationDto notification);
    Task NotifyUnreadCountUpdatedAsync(string userId, int unreadCount);
}
