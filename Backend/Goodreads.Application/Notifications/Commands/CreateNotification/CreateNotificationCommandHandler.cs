using Goodreads.Application.Common.Interfaces;
using Goodreads.Domain.Entities;
using MediatR;
using Microsoft.Extensions.Logging;
using SharedKernel;

namespace Goodreads.Application.Notifications.Commands.CreateNotification;

public class CreateNotificationCommandHandler : IRequestHandler<CreateNotificationCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateNotificationCommandHandler> _logger;

    public CreateNotificationCommandHandler(
        IUnitOfWork unitOfWork,
        ILogger<CreateNotificationCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<string>> Handle(CreateNotificationCommand request, CancellationToken cancellationToken)
    {
        // Prevent self-notification
        if (request.UserId == request.ActorId)
            return Result<string>.Ok(string.Empty); // Silently skip self-notifications

        // Check for duplicate notification (same type, same entities, within last 5 minutes)
        var fiveMinutesAgo = DateTime.UtcNow.AddMinutes(-5);
        var existingNotification = await _unitOfWork.Notifications.GetSingleOrDefaultAsync(
            filter: n => n.UserId == request.UserId &&
                         n.ActorId == request.ActorId &&
                         n.Type == request.Type &&
                         n.RelatedEntityId == request.RelatedEntityId &&
                         n.RelatedEntityType == request.RelatedEntityType &&
                         n.CreatedAt >= fiveMinutesAgo &&
                         !n.IsRead
        );

        if (existingNotification != null)
        {
            _logger.LogInformation("Duplicate notification prevented for user {UserId}, actor {ActorId}, type {Type}",
                request.UserId, request.ActorId, request.Type);
            return Result<string>.Ok(existingNotification.Id);
        }

        var notification = new Notification
        {
            UserId = request.UserId,
            ActorId = request.ActorId,
            Type = request.Type,
            Title = request.Title,
            Message = request.Message,
            RelatedEntityId = request.RelatedEntityId,
            RelatedEntityType = request.RelatedEntityType
        };

        await _unitOfWork.Notifications.AddAsync(notification);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Created notification {NotificationId} for user {UserId} from actor {ActorId}, type {Type}",
            notification.Id, request.UserId, request.ActorId, request.Type);

        return Result<string>.Ok(notification.Id);
    }
}
