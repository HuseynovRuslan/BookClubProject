using MediatR;
using SharedKernel;

namespace Goodreads.Application.Notifications.Commands.MarkAllAsRead;

public record MarkAllAsReadCommand() : IRequest<Result<int>>;
