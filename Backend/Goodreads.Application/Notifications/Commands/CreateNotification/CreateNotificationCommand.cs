using Goodreads.Domain.Entities;
using MediatR;
using SharedKernel;

namespace Goodreads.Application.Notifications.Commands.CreateNotification;

// Internal command - should not be exposed via API
public record CreateNotificationCommand(
    string UserId,
    string ActorId,
    NotificationType Type,
    string Title,
    string? Message = null,
    string? RelatedEntityId = null,
    string? RelatedEntityType = null
) : IRequest<Result<string>>;
