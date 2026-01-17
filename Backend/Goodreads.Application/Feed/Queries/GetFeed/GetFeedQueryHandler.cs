using Goodreads.Application.Common.Extensions;
using Goodreads.Application.Common.Interfaces;
using Goodreads.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Goodreads.Application.Feed.Queries.GetFeed;
public class GetFeedQueryHandler : IRequestHandler<GetFeedQuery, PagedResult<FeedItemDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly IUserFollowRepository _userFollowRepository;
    private readonly UserManager<User> _userManager;
    private readonly IMapper _mapper;
    private readonly ILogger<GetFeedQueryHandler> _logger;
    private readonly IBookImageService _bookImageService;
    private readonly IApplicationDbContext _context;

    public GetFeedQueryHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        IUserFollowRepository userFollowRepository,
        UserManager<User> userManager,
        IMapper mapper,
        ILogger<GetFeedQueryHandler> logger,
        IBookImageService bookImageService,
        IApplicationDbContext context)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _userFollowRepository = userFollowRepository;
        _userManager = userManager;
        _mapper = mapper;
        _logger = logger;
        _bookImageService = bookImageService;
        _context = context;
    }

    public async Task<PagedResult<FeedItemDto>> Handle(GetFeedQuery request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            throw new UnauthorizedAccessException("User is not authenticated");

        var following = await _userFollowRepository.GetFollowingAsync(userId, null, null);
        
        var followingIds = following.Select(f => f.Id).ToList();
        
        if (!followingIds.Contains(userId))
        {
            followingIds.Add(userId);
        }
        
        if (!followingIds.Any())
        {
            return PagedResult<FeedItemDto>.Create(
                new List<FeedItemDto>(),
                request.PageNumber ?? 1,
                request.PageSize ?? 10,
                0
            );
        }

        var (quotes, _) = await _unitOfWork.Quotes
            .GetAllAsync(filter: q => followingIds.Contains(q.CreatedByUserId), includes: new[] { "Likes" });
        
        var quotesList = quotes.ToList();
        
        var quoteBookIds = quotesList.Where(q => !string.IsNullOrEmpty(q.BookId)).Select(q => q.BookId).Distinct().ToList();
        var quoteBooks = new Dictionary<string, Book>();
        if (quoteBookIds.Any())
        {
            var (books, __) = await _unitOfWork.Books.GetAllAsync(filter: b => quoteBookIds.Contains(b.Id), includes: new[] { "Author" });
            foreach (var book in books)
            {
                quoteBooks[book.Id] = book;
            }
        }
        
        _logger.LogInformation("Fetched {Count} books for {QuoteCount} quotes", quoteBooks.Count, quotesList.Count);

        var quoteIds = quotesList.Select(q => q.Id).ToList();
        
        var userQuoteLikes = new HashSet<string>();
        if (quoteIds.Any())
        {
            var (likes, _) = await _unitOfWork.QuoteLikes.GetAllAsync(
                filter: l => l.UserId == userId && quoteIds.Contains(l.QuoteId));
            userQuoteLikes = likes.Select(l => l.QuoteId).ToHashSet();
        }
        
        var quoteLikeCounts = quotesList.ToDictionary(q => q.Id, q => q.Likes?.Count ?? 0);
        
        var quoteCommentCounts = new Dictionary<string, int>();
        if (quoteIds.Any())
        {
            var (allQuoteComments, _) = await _unitOfWork.Comments.GetAllAsync(
                filter: c => c.TargetId != null && quoteIds.Contains(c.TargetId));
            quoteCommentCounts = allQuoteComments
                .Where(c => c.TargetId != null)
                .GroupBy(c => c.TargetId!)
                .ToDictionary(g => g.Key, g => g.Count());
        }

        var (reviews, ___) = await _unitOfWork.BookReviews
            .GetAllAsync(filter: r => followingIds.Contains(r.UserId), includes: new[] { "Book", "User" });
        
        var reviewsList = reviews.ToList();
        var reviewIds = reviewsList.Select(r => r.Id).ToList();
        
        var userReviewLikes = new HashSet<string>();
        if (reviewIds.Any())
        {
            var (likes, _) = await _unitOfWork.Likes.GetAllAsync(
                filter: l => l.UserId == userId && l.TargetType == "Review" && reviewIds.Contains(l.TargetId));
            userReviewLikes = likes.Select(l => l.TargetId).ToHashSet();
        }
        
        var reviewLikeCounts = new Dictionary<string, int>();
        if (reviewIds.Any())
        {
            var (allReviewLikes, _) = await _unitOfWork.Likes.GetAllAsync(
                filter: l => l.TargetType == "Review" && reviewIds.Contains(l.TargetId));
            reviewLikeCounts = allReviewLikes
                .GroupBy(l => l.TargetId)
                .ToDictionary(g => g.Key, g => g.Count());
        }
        
        var reviewCommentCounts = new Dictionary<string, int>();
        if (reviewIds.Any())
        {
            var (allReviewComments, _) = await _unitOfWork.Comments.GetAllAsync(
                filter: c => c.TargetId != null && reviewIds.Contains(c.TargetId));
            reviewCommentCounts = allReviewComments
                .Where(c => c.TargetId != null)
                .GroupBy(c => c.TargetId!)
                .ToDictionary(g => g.Key, g => g.Count());
        }

        var (shelves, ____) = await _unitOfWork.Shelves
            .GetAllAsync(filter: s => followingIds.Contains(s.UserId));
        
        var shelvesList = shelves.ToList();
        var shelfIds = shelvesList.Select(s => s.Id).ToList();

        var bookShelvesList = await _context.BookShelves
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Include(bs => bs.Book)
                .ThenInclude(b => b.Author)
            .Where(bs => shelfIds.Contains(bs.ShelfId) && !bs.IsDeleted)
            .Where(bs => bs.Book != null && !bs.Book.IsDeleted)
            .OrderByDescending(bs => bs.AddedAt)
            .ToListAsync(cancellationToken);
        
        _logger.LogInformation("Fetched {Count} bookShelves for following feed", bookShelvesList.Count);

        var bookShelfIds = bookShelvesList.Select(bs => $"{bs.BookId}-{bs.ShelfId}").ToList();
        
        var bookShelfPairs = bookShelvesList.Select(bs => new { bs.BookId, bs.ShelfId }).ToList();
        var bsBookIds = bookShelfPairs.Select(p => p.BookId).Distinct().ToList();
        var bsShelfIds = bookShelfPairs.Select(p => p.ShelfId).Distinct().ToList();
        
        var userBookShelfLikes = new HashSet<string>();
        if (bookShelfIds.Any())
        {
            var (likes, _) = await _unitOfWork.BookShelfLikes.GetAllAsync(
                filter: bsl => bsl.UserId == userId && bsBookIds.Contains(bsl.BookId) && bsShelfIds.Contains(bsl.ShelfId));
            userBookShelfLikes = likes.Select(l => $"{l.BookId}-{l.ShelfId}").ToHashSet();
        }
        
        var bookShelfLikeCounts = new Dictionary<string, int>();
        if (bookShelfIds.Any())
        {
            var (allBookShelfLikes, _) = await _unitOfWork.BookShelfLikes.GetAllAsync(
                filter: bsl => bsBookIds.Contains(bsl.BookId) && bsShelfIds.Contains(bsl.ShelfId));
            bookShelfLikeCounts = allBookShelfLikes
                .GroupBy(l => $"{l.BookId}-{l.ShelfId}")
                .ToDictionary(g => g.Key, g => g.Count());
        }
        
        var bookShelfCommentCounts = new Dictionary<string, int>();
        if (bookShelfIds.Any())
        {
            var (allBookShelfComments, _) = await _unitOfWork.Comments.GetAllAsync(
                filter: c => c.TargetId != null && bookShelfIds.Contains(c.TargetId));
            bookShelfCommentCounts = allBookShelfComments
                .Where(c => c.TargetId != null)
                .GroupBy(c => c.TargetId!)
                .ToDictionary(g => g.Key, g => g.Count());
        }

        var feedItems = new List<FeedItemDto>();

        foreach (var quote in quotesList)
        {
            var user = await _userManager.FindByIdAsync(quote.CreatedByUserId);
            if (user != null)
            {
                var quoteDto = _mapper.Map<QuoteDto>(quote);
                quoteDto.IsLiked = userQuoteLikes.Contains(quote.Id);
                quoteDto.LikesCount = quoteLikeCounts.GetValueOrDefault(quote.Id, 0);
                quoteDto.CommentsCount = quoteCommentCounts.GetValueOrDefault(quote.Id, 0);
                
                var feedItem = new FeedItemDto
                {
                    Id = quote.Id,
                    ActivityType = "Quote",
                    CreatedAt = quote.CreatedAt,
                    User = _mapper.Map<UserDto>(user),
                    Quote = quoteDto
                };
                
                if (!string.IsNullOrEmpty(quote.BookId) && quoteBooks.TryGetValue(quote.BookId, out var book))
                {
                    var bookDto = _mapper.Map<BookDto>(book);
                    
                    bookDto.CoverImageUrl = _bookImageService.GetCoverImageUrl(
                        book.CoverImageUrl,
                        book.ISBN,
                        book.CoverImageBlobName
                    );
                    
                    feedItem.Book = bookDto;
                    _logger.LogInformation("Added book to quote {QuoteId}: BookId={BookId}, Title={Title}, AuthorName={AuthorName}", 
                        quote.Id, book.Id, book.Title, feedItem.Book?.AuthorName);
                }
                else
                {
                    _logger.LogWarning("Book not found for quote {QuoteId}, BookId={BookId}", quote.Id, quote.BookId);
                }
                
                feedItems.Add(feedItem);
            }
        }

        foreach (var review in reviewsList)
        {
            var user = await _userManager.FindByIdAsync(review.UserId);
            if (user != null)
            {
                var reviewDto = _mapper.Map<BookReviewDto>(review);
                reviewDto.IsLiked = userReviewLikes.Contains(review.Id);
                reviewDto.LikesCount = reviewLikeCounts.GetValueOrDefault(review.Id, 0);
                reviewDto.CommentsCount = reviewCommentCounts.GetValueOrDefault(review.Id, 0);
                
                feedItems.Add(new FeedItemDto
                {
                    Id = review.Id,
                    ActivityType = "Review",
                    CreatedAt = review.CreatedAt,
                    User = _mapper.Map<UserDto>(user),
                    Review = reviewDto
                });
            }
        }

        foreach (var bookShelf in bookShelvesList)
        {
            if (bookShelf.Book == null)
                continue;

            var shelf = await _unitOfWork.Shelves.GetByIdAsync(bookShelf.ShelfId);
            if (shelf == null)
                continue;

            var user = await _userManager.FindByIdAsync(shelf.UserId);
            if (user == null)
                continue;

            var bookDto = _mapper.Map<BookDto>(bookShelf.Book);
            
            bookDto.CoverImageUrl = _bookImageService.GetCoverImageUrl(
                bookShelf.Book.CoverImageUrl,
                bookShelf.Book.ISBN,
                bookShelf.Book.CoverImageBlobName
            );
            
            var bookShelfId = $"{bookShelf.BookId}-{bookShelf.ShelfId}";
            feedItems.Add(new FeedItemDto
            {
                Id = bookShelfId,
                ActivityType = "BookAdded",
                CreatedAt = bookShelf.AddedAt,
                User = _mapper.Map<UserDto>(user),
                Book = bookDto,
                ShelfName = shelf.Name,
                BookShelfId = bookShelfId,
                IsLiked = userBookShelfLikes.Contains(bookShelfId),
                LikesCount = bookShelfLikeCounts.GetValueOrDefault(bookShelfId, 0),
                CommentsCount = bookShelfCommentCounts.GetValueOrDefault(bookShelfId, 0)
            });
        }

        feedItems = feedItems.OrderByDescending(f => f.CreatedAt).ToList();


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

