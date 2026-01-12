using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using MediatR;

namespace Goodreads.Application.Messages.Queries.GetConversations;
public record GetConversationsQuery(QueryParameters Parameters) : IRequest<PagedResult<ConversationDto>>;
