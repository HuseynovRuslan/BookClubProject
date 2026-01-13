using MediatR;
using SharedKernel;

namespace Goodreads.Application.Notifications.Commands.MarkAsRead;

public record MarkAsReadCommand(string NotificationId) : IRequest<Result<bool>>;
