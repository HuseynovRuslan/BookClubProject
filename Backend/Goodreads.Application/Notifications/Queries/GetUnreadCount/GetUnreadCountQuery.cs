using MediatR;

namespace Goodreads.Application.Notifications.Queries.GetUnreadCount;

public record GetUnreadCountQuery() : IRequest<int>;
