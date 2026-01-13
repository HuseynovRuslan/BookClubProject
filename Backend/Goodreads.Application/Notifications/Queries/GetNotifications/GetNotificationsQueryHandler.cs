using AutoMapper;
using Goodreads.Application.Common.Interfaces;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Goodreads.Application.Notifications.Queries.GetNotifications;

public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, PagedResult<NotificationDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly IMapper _mapper;
    private readonly ILogger<GetNotificationsQueryHandler> _logger;

    public GetNotificationsQueryHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        IMapper mapper,
        ILogger<GetNotificationsQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<PagedResult<NotificationDto>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            throw new UnauthorizedAccessException("User is not authenticated");

        var (notifications, count) = await _unitOfWork.Notifications.GetAllAsync(
            filter: n => n.UserId == userId,
            includes: new[] { "Actor" },
            sortColumn: "CreatedAt",
            sortOrder: "desc",
            pageNumber: request.Parameters.PageNumber,
            pageSize: request.Parameters.PageSize
        );

        var dtos = new List<NotificationDto>();
        foreach (var notification in notifications)
        {
            var dto = _mapper.Map<NotificationDto>(notification);
            if (notification.Actor != null)
            {
                dto.Actor = _mapper.Map<UserDto>(notification.Actor);
            }
            dtos.Add(dto);
        }

        _logger.LogInformation("Retrieved {Count} notifications for user {UserId}", count, userId);

        return PagedResult<NotificationDto>.Create(dtos, request.Parameters.PageNumber, request.Parameters.PageSize, count);
    }
}
