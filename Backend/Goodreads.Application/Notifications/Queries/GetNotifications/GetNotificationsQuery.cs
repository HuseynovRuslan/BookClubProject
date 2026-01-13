using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using MediatR;

namespace Goodreads.Application.Notifications.Queries.GetNotifications;

public record GetNotificationsQuery(QueryParameters Parameters) : IRequest<PagedResult<NotificationDto>>;
