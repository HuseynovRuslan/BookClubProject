using Goodreads.Application.Common.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Goodreads.Application.Notifications.Queries.GetUnreadCount;

public class GetUnreadCountQueryHandler : IRequestHandler<GetUnreadCountQuery, int>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly ILogger<GetUnreadCountQueryHandler> _logger;

    public GetUnreadCountQueryHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        ILogger<GetUnreadCountQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _logger = logger;
    }

    public async Task<int> Handle(GetUnreadCountQuery request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            return 0;

        var (notifications, count) = await _unitOfWork.Notifications.GetAllAsync(
            filter: n => n.UserId == userId && !n.IsRead
        );

        _logger.LogInformation("User {UserId} has {Count} unread notifications", userId, count);

        return count;
    }
}
