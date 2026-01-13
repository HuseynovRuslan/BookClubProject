using System.Linq.Expressions;
using Goodreads.Domain.Constants;

namespace Goodreads.Application.UserYearChallenges.Queries.GetAllUserYearChallenges;
public class GetAllUserYearChallengesQueryHandler
    : IRequestHandler<GetAllUserYearChallengesQuery, PagedResult<UserYearChallengeDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<GetAllUserYearChallengesQueryHandler> _logger;

    public GetAllUserYearChallengesQueryHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        IMapper mapper,
        ILogger<GetAllUserYearChallengesQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<PagedResult<UserYearChallengeDto>> Handle(GetAllUserYearChallengesQuery request, CancellationToken cancellationToken)
    {
        var p = request.Parameters;
        var userId = request.UserId;

        Expression<Func<UserYearChallenge, bool>> filter = c =>
            c.UserId == userId && (!request.Year.HasValue || c.Year == request.Year.Value);

        var (items, count) = await _unitOfWork.UserYearChallenges.GetAllAsync(
            filter: filter,
            sortColumn: p.SortColumn,
            sortOrder: p.SortOrder,
            pageNumber: p.PageNumber,
            pageSize: p.PageSize
        );

        var dtoList = _mapper.Map<List<UserYearChallengeDto>>(items);

        // Update CompletedBooksCount with real-time count for each challenge
        foreach (var dto in dtoList)
        {
            var completedCount = await _unitOfWork.BookShelves.CountAsync(
                bs => bs.Shelf.UserId == userId &&
                      bs.Shelf.IsDefault &&
                      bs.Shelf.Name == DefaultShelves.Read &&
                      bs.AddedAt.Year == dto.Year);
            dto.CompletedBooksCount = completedCount;
        }

        _logger.LogInformation("Retrieved {Count} challenges for user {UserId}", count, userId);

        return PagedResult<UserYearChallengeDto>.Create(dtoList, p.PageNumber, p.PageSize, count);
    }
}

