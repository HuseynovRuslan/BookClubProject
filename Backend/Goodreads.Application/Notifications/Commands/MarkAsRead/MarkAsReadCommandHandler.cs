using Goodreads.Application.Common.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;
using SharedKernel;

namespace Goodreads.Application.Notifications.Commands.MarkAsRead;

public class MarkAsReadCommandHandler : IRequestHandler<MarkAsReadCommand, Result<bool>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly ILogger<MarkAsReadCommandHandler> _logger;

    public MarkAsReadCommandHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        ILogger<MarkAsReadCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(MarkAsReadCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            return Result<bool>.Fail(Error.Unauthorized("Notifications.Unauthorized", "User is not authenticated"));

        var notification = await _unitOfWork.Notifications.GetByIdAsync(request.NotificationId);
        if (notification == null)
            return Result<bool>.Fail(Error.NotFound("Notifications.NotFound", $"Notification with ID '{request.NotificationId}' not found"));

        if (notification.UserId != userId)
            return Result<bool>.Fail(Error.Forbidden("Notifications.NotAuthorized", "You are not authorized to perform this action on this notification"));

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("User {UserId} marked notification {NotificationId} as read", userId, request.NotificationId);
        }

        return Result<bool>.Ok(true);
    }
}
