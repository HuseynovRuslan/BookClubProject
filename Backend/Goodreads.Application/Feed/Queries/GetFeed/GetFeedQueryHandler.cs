using Goodreads.Application.Common.Extensions;
using Goodreads.Application.Common.Interfaces;
using Goodreads.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Goodreads.Application.Feed.Queries.GetFeed;
public class GetFeedQueryHandler : IRequestHandler<GetFeedQuery, PagedResult<FeedItemDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly IUserFollowRepository _userFollowRepository;
    private readonly UserManager<User> _userManager;
    private readonly IMapper _mapper;
    private readonly ILogger<GetFeedQueryHandler> _logger;

    public GetFeedQueryHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        IUserFollowRepository userFollowRepository,
        UserManager<User> userManager,
        IMapper mapper,
        ILogger<GetFeedQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _userFollowRepository = userFollowRepository;
        _userManager = userManager;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<PagedResult<FeedItemDto>> Handle(GetFeedQuery request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            throw new UnauthorizedAccessException("User is not authenticated");

        // Get following user IDs
        var following = await _userFollowRepository.GetFollowingAsync(userId, null, null);
        
        var followingIds = following.Select(f => f.Id).ToList();
        if (!followingIds.Any())
        {
            return PagedResult<FeedItemDto>.Create(
                new List<FeedItemDto>(),
                request.PageNumber ?? 1,
                request.PageSize ?? 10,
                0
            );
        }

        // Get quotes from following users
        var quotes = await _unitOfWork.Quotes
            .GetAllAsync(filter: q => followingIds.Contains(q.CreatedByUserId));

        // Get reviews from following users
        var reviews = await _unitOfWork.BookReviews
            .GetAllAsync(filter: r => followingIds.Contains(r.UserId));

        // Get shelves from following users first
        var shelves = await _unitOfWork.Shelves
            .GetAllAsync(filter: s => followingIds.Contains(s.UserId));
        var shelfIds = shelves.Items.Select(s => s.Id).ToList();

        // Get book additions from following users (BookShelf)
        var bookShelves = await _unitOfWork.BookShelves
            .GetAllAsync(filter: bs => shelfIds.Contains(bs.ShelfId));

        // Combine all activities
        var feedItems = new List<FeedItemDto>();

        // Add quotes
        foreach (var quote in quotes.Items)
        {
            var user = await _userManager.FindByIdAsync(quote.CreatedByUserId);
            if (user != null)
            {
                feedItems.Add(new FeedItemDto
                {
                    Id = quote.Id,
                    ActivityType = "Quote",
                    CreatedAt = quote.CreatedAt,
                    User = _mapper.Map<UserDto>(user),
                    Quote = _mapper.Map<QuoteDto>(quote)
                });
            }
        }

        // Add reviews
        foreach (var review in reviews.Items)
        {
            var user = await _userManager.FindByIdAsync(review.UserId);
            if (user != null)
            {
                feedItems.Add(new FeedItemDto
                {
                    Id = review.Id,
                    ActivityType = "Review",
                    CreatedAt = review.CreatedAt,
                    User = _mapper.Map<UserDto>(user),
                    Review = _mapper.Map<BookReviewDto>(review)
                });
            }
        }

        // Add book additions
        foreach (var bookShelf in bookShelves.Items)
        {
            var shelf = await _unitOfWork.Shelves.GetByIdAsync(bookShelf.ShelfId);
            if (shelf != null)
            {
                var user = await _userManager.FindByIdAsync(shelf.UserId);
                if (user != null)
                {
                    feedItems.Add(new FeedItemDto
                    {
                        Id = $"{bookShelf.BookId}-{bookShelf.ShelfId}",
                        ActivityType = "BookAdded",
                        CreatedAt = bookShelf.AddedAt,
                        User = _mapper.Map<UserDto>(user),
                        Book = _mapper.Map<BookDto>(bookShelf.Book),
                        ShelfName = shelf.Name
                    });
                }
            }
        }

        // Sort by CreatedAt descending
        feedItems = feedItems.OrderByDescending(f => f.CreatedAt).ToList();

        // Apply pagination
        var pageNumber = request.PageNumber ?? 1;
        var pageSize = request.PageSize ?? 10;
        var totalCount = feedItems.Count;
        var pagedItems = feedItems
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return PagedResult<FeedItemDto>.Create(pagedItems, pageNumber, pageSize, totalCount);
    }
}

