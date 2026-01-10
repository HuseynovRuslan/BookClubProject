namespace Goodreads.Application.Comments.Queries.GetCommentById;

public class GetCommentByIdQueryHandler : IRequestHandler<GetCommentByIdQuery, Result<CommentDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetCommentByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<CommentDto>> Handle(GetCommentByIdQuery request, CancellationToken cancellationToken)
    {
        var comment = await _unitOfWork.Comments.GetByIdAsync(request.Id, includes: new[] { "User" });

        if (comment == null)
        {
            return Result<CommentDto>.Fail(CommentErrors.NotFound(request.Id));
        }

        return Result<CommentDto>.Ok(_mapper.Map<CommentDto>(comment));
    }
}
