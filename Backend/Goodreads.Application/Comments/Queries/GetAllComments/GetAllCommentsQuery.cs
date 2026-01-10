using Goodreads.Application.Common;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using MediatR;

namespace Goodreads.Application.Comments.Queries.GetAllComments;

public record GetAllCommentsQuery(QueryParameters Parameters, string? TargetId = null) : IRequest<PagedResult<CommentDto>>;
