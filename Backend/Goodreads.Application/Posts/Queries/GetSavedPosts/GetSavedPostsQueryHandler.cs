using AutoMapper;
using Goodreads.Application.Common.Interfaces;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using MediatR;

namespace Goodreads.Application.Posts.Queries.GetSavedPosts;

public class GetSavedPostsQueryHandler
    : IRequestHandler<GetSavedPostsQuery, PagedResult<SavedPostDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly IMapper _mapper;

    public GetSavedPostsQueryHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _mapper = mapper;
    }

    public async Task<PagedResult<SavedPostDto>> Handle(
        GetSavedPostsQuery request,
        CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;

        if (userId == null)
            throw new UnauthorizedAccessException("User is not authenticated");

        var pageNumber = request.Parameters.PageNumber ?? 1;
        var pageSize = request.Parameters.PageSize ?? 10;

        var (savedPosts, count) = await _unitOfWork.SavedPosts.GetAllAsync(
            filter: sp => sp.UserId == userId,
            sortColumn: "SavedAt",
            sortOrder: "desc",
            pageNumber: pageNumber,
            pageSize: pageSize
        );

        var dtos = new List<SavedPostDto>();

        foreach (var sp in savedPosts)
        {
            var dto = new SavedPostDto
            {
                PostId = sp.PostId,
                PostType = sp.PostType,
                SavedAt = sp.SavedAt
            };

            if (sp.PostType == "Quote")
            {
                var quote = await _unitOfWork.Quotes.GetByIdAsync(sp.PostId, new[] { "CreatedBy", "Likes", "Book", "Book.Author" });
                if (quote != null)
                {
                    dto.Quote = _mapper.Map<QuoteDto>(quote);
                }
            }
            else if (sp.PostType == "Review")
            {
                var review = await _unitOfWork.BookReviews.GetByIdAsync(sp.PostId, new[] { "User", "Book", "Book.Author" });
                if (review != null)
                {
                    dto.Review = _mapper.Map<BookReviewDto>(review);
                }
            }

            dtos.Add(dto);
        }

        return PagedResult<SavedPostDto>.Create(
            dtos,
            pageNumber,
            pageSize,
            count
        );
    }
}
