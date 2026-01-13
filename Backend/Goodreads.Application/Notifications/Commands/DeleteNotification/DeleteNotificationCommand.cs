using MediatR;
using SharedKernel;

namespace Goodreads.Application.Notifications.Commands.DeleteNotification;

public record DeleteNotificationCommand(string NotificationId) : IRequest<Result<bool>>;
