namespace Goodreads.Application.FeedBacks.Queries.GetFeedBackById;

internal class GetFeedBackByIdQueryHandler : IRequestHandler<GetFeedBackByIdQuery, Result<FeedBackDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetFeedBackByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<FeedBackDto>> Handle(GetFeedBackByIdQuery request, CancellationToken cancellationToken)
    {
        var feedback = await _unitOfWork.FeedBacks.GetByIdAsync(request.Id, includes: new[] { "User" });

        if (feedback == null)
        {
            return Result<FeedBackDto>.Fail(FeedBackErrors.NotFound(request.Id));
        }

        var feedbackDto = _mapper.Map<FeedBackDto>(feedback);
        return Result<FeedBackDto>.Ok(feedbackDto);
    }
}
