using Goodreads.Application.Common.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;
using SharedKernel;

namespace Goodreads.Application.Notifications.Commands.MarkAllAsRead;

public class MarkAllAsReadCommandHandler : IRequestHandler<MarkAllAsReadCommand, Result<int>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly ILogger<MarkAllAsReadCommandHandler> _logger;

    public MarkAllAsReadCommandHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        ILogger<MarkAllAsReadCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _logger = logger;
    }

    public async Task<Result<int>> Handle(MarkAllAsReadCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            return Result<int>.Fail(Error.Unauthorized("Notifications.Unauthorized", "User is not authenticated"));

        var (notifications, _) = await _unitOfWork.Notifications.GetAllAsync(
            filter: n => n.UserId == userId && !n.IsRead
        );

        var count = 0;
        var now = DateTime.UtcNow;
        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            notification.ReadAt = now;
            count++;
        }

        if (count > 0)
        {
            await _unitOfWork.SaveChangesAsync();
            _logger.LogInformation("User {UserId} marked {Count} notifications as read", userId, count);
        }

        return Result<int>.Ok(count);
    }
}
