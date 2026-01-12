using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using MediatR;

namespace Goodreads.Application.Messages.Queries.GetMessages;
public record GetMessagesQuery(string OtherUserId, QueryParameters Parameters) : IRequest<PagedResult<MessageDto>>;
