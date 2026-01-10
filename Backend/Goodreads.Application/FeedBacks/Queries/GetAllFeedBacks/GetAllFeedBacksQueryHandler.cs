using System.Linq.Expressions;

namespace Goodreads.Application.FeedBacks.Queries.GetAllFeedBacks;

internal class GetAllFeedBacksQueryHandler : IRequestHandler<GetAllFeedBacksQuery, PagedResult<FeedBackDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<GetAllFeedBacksQueryHandler> _logger;
    private readonly IMapper _mapper;

    public GetAllFeedBacksQueryHandler(IUnitOfWork unitOfWork, ILogger<GetAllFeedBacksQueryHandler> logger, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _mapper = mapper;
    }

    public async Task<PagedResult<FeedBackDto>> Handle(GetAllFeedBacksQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling GetAllFeedBacksQuery");
        
        var p = request.Parameters;

        Expression<Func<FeedBack, bool>> filter = f => 
            string.IsNullOrEmpty(p.Query) || 
            f.Subject.Contains(p.Query) || 
            f.Message.Contains(p.Query) ||
            f.User.UserName.Contains(p.Query);

        var (feedbacks, totalCount) = await _unitOfWork.FeedBacks.GetAllAsync(
            filter: filter,
            includes: new[] { "User" },
            sortColumn: p.SortColumn,
            sortOrder: p.SortOrder,
            pageNumber: p.PageNumber,
            pageSize: p.PageSize
        );

        var dtos = _mapper.Map<List<FeedBackDto>>(feedbacks);

        return PagedResult<FeedBackDto>.Create(dtos, p.PageNumber, p.PageSize, totalCount);
    }
}
