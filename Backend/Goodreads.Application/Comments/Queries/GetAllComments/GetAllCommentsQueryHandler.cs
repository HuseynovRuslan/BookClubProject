using AutoMapper;
using Goodreads.Application.Common;
using Goodreads.Application.Common.Interfaces;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using Goodreads.Domain.Entities;
using MediatR;
using System.Linq.Expressions;

namespace Goodreads.Application.Comments.Queries.GetAllComments;

public class GetAllCommentsQueryHandler : IRequestHandler<GetAllCommentsQuery, PagedResult<CommentDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetAllCommentsQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<PagedResult<CommentDto>> Handle(GetAllCommentsQuery request, CancellationToken cancellationToken)
    {
        Expression<Func<Comment, bool>> filter = c =>
            string.IsNullOrEmpty(request.TargetId) || c.TargetId == request.TargetId;

        var (items, count) = await _unitOfWork.Comments.GetAllAsync(
            filter: filter,
            includes: new[] { "User" },
            sortColumn: request.Parameters.SortColumn,
            sortOrder: request.Parameters.SortOrder,
            pageNumber: request.Parameters.PageNumber,
            pageSize: request.Parameters.PageSize
        );

        var dtoList = _mapper.Map<List<CommentDto>>(items);

        return PagedResult<CommentDto>.Create(dtoList, request.Parameters.PageNumber, request.Parameters.PageSize, count);
    }
}
