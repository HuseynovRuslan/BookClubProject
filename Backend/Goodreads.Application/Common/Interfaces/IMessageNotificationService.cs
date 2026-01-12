using Goodreads.Application.DTOs;

namespace Goodreads.Application.Common.Interfaces;
public interface IMessageNotificationService
{
    Task SendMessageToUserAsync(string userId, MessageDto message);
    Task SendMessageToGroupAsync(string groupName, MessageDto message);
    Task NotifyMessageReadAsync(string userId, string messageId, DateTime readAt);
}
