using Goodreads.Application.Common.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;
using SharedKernel;

namespace Goodreads.Application.Notifications.Commands.DeleteNotification;

public class DeleteNotificationCommandHandler : IRequestHandler<DeleteNotificationCommand, Result<bool>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly ILogger<DeleteNotificationCommandHandler> _logger;

    public DeleteNotificationCommandHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        ILogger<DeleteNotificationCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(DeleteNotificationCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            return Result<bool>.Fail(Error.Unauthorized("Notifications.Unauthorized", "User is not authenticated"));

        var notification = await _unitOfWork.Notifications.GetByIdAsync(request.NotificationId);
        if (notification == null)
            return Result<bool>.Fail(Error.NotFound("Notifications.NotFound", $"Notification with ID '{request.NotificationId}' not found"));

        if (notification.UserId != userId)
            return Result<bool>.Fail(Error.Forbidden("Notifications.NotAuthorized", "You are not authorized to perform this action on this notification"));

        notification.IsDeleted = true;
        notification.DeletedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("User {UserId} deleted notification {NotificationId}", userId, request.NotificationId);

        return Result<bool>.Ok(true);
    }
}
