using Goodreads.Application.Common.Interfaces;

namespace Goodreads.Application.Quotes.Queries.GetQuoteById;
internal class GetQuoteByIdQueryHandler : IRequestHandler<GetQuoteByIdQuery, Result<QuoteDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IUserContext _userContext;

    public GetQuoteByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper, IUserContext userContext)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _userContext = userContext;
    }

    public async Task<Result<QuoteDto>> Handle(GetQuoteByIdQuery request, CancellationToken cancellationToken)
    {
        var quote = await _unitOfWork.Quotes.GetByIdAsync(request.Id, "Likes");
        if (quote == null)
            return Result<QuoteDto>.Fail(QuoteErrors.NotFound(request.Id));

        var quoteDto = _mapper.Map<QuoteDto>(quote);

        // Check if current user liked this quote
        var currentUserId = _userContext.UserId;
        if (!string.IsNullOrEmpty(currentUserId))
        {
            var userLike = await _unitOfWork.QuoteLikes.GetSingleOrDefaultAsync(
                filter: l => l.QuoteId == request.Id && l.UserId == currentUserId);
            quoteDto.IsLiked = userLike != null;
        }
        else
        {
            quoteDto.IsLiked = false;
        }

        return Result<QuoteDto>.Ok(quoteDto);
    }
}

