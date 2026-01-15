using Goodreads.Application.Common.Extensions;
using Goodreads.Application.Common.Interfaces;
using Goodreads.Application.Feed.Queries.GetFeed;
using Goodreads.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Goodreads.Application.Feed.Queries.GetSocialFeed;

public class GetSocialFeedQueryHandler : IRequestHandler<GetSocialFeedQuery, PagedResult<FeedItemDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly UserManager<User> _userManager;
    private readonly IMapper _mapper;
    private readonly ILogger<GetSocialFeedQueryHandler> _logger;
    private readonly IBookImageService _bookImageService;
    private readonly IApplicationDbContext _context;

    public GetSocialFeedQueryHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        UserManager<User> userManager,
        IMapper mapper,
        ILogger<GetSocialFeedQueryHandler> logger,
        IBookImageService bookImageService,
        IApplicationDbContext context)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _userManager = userManager;
        _mapper = mapper;
        _logger = logger;
        _bookImageService = bookImageService;
        _context = context;
    }

    public async Task<PagedResult<FeedItemDto>> Handle(GetSocialFeedQuery request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            throw new UnauthorizedAccessException("User is not authenticated");

        // Get quotes from all users including current user
        var (quotes, _) = await _unitOfWork.Quotes
            .GetAllAsync(includes: new[] { "Likes" });
        
        var quotesList = quotes.ToList();
        
        // Get books for quotes to include book and author info
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

        // Get reviews from all users including current user
        var (reviews, ___) = await _unitOfWork.BookReviews
            .GetAllAsync(includes: new[] { "Book", "User" });
        
        var reviewsList = reviews.ToList();
        var reviewIds = reviewsList.Select(r => r.Id).ToList();
        
        // Get current user's likes for reviews
        var userReviewLikes = new HashSet<string>();
        if (reviewIds.Any())
        {
            var (likes, _) = await _unitOfWork.Likes.GetAllAsync(
                filter: l => l.UserId == userId && l.TargetType == "Review" && reviewIds.Contains(l.TargetId));
            userReviewLikes = likes.Select(l => l.TargetId).ToHashSet();
        }
        
        // Get like counts for reviews
        var reviewLikeCounts = new Dictionary<string, int>();
        if (reviewIds.Any())
        {
            var (allReviewLikes, _) = await _unitOfWork.Likes.GetAllAsync(
                filter: l => l.TargetType == "Review" && reviewIds.Contains(l.TargetId));
            reviewLikeCounts = allReviewLikes
                .GroupBy(l => l.TargetId)
                .ToDictionary(g => g.Key, g => g.Count());
        }

        // Get shelves from all users including current user
        var (shelves, ____) = await _unitOfWork.Shelves
            .GetAllAsync(filter: null);
        
        var shelvesList = shelves.ToList();
        var shelfIds = shelvesList.Select(s => s.Id).ToList();

        // Get book additions from all users (BookShelf) - include Book and Author
        // Use IgnoreQueryFilters to include soft-deleted books in feed
        // Note: IgnoreQueryFilters applies to all entities in the query, including included navigation properties
        var bookShelvesList = await _context.BookShelves
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Include(bs => bs.Book)
                .ThenInclude(b => b.Author)
            .Where(bs => shelfIds.Contains(bs.ShelfId) && !bs.IsDeleted)
            .Where(bs => bs.Book != null && !bs.Book.IsDeleted)
            .OrderByDescending(bs => bs.AddedAt)
            .ToListAsync(cancellationToken);
        
        _logger.LogInformation("Fetched {Count} bookShelves for social feed", bookShelvesList.Count);

        // Get BookShelf IDs (composite format: BookId-ShelfId)
        var bookShelfIds = bookShelvesList.Select(bs => $"{bs.BookId}-{bs.ShelfId}").ToList();
        
        // Get current user's likes for all quotes
        var quoteIds = quotesList.Select(q => q.Id).ToList();
        var userLikes = new HashSet<string>();
        
        if (quoteIds.Any())
        {
            var (likes, _) = await _unitOfWork.QuoteLikes.GetAllAsync(
                filter: l => l.UserId == userId && quoteIds.Contains(l.QuoteId));
            userLikes = likes.Select(l => l.QuoteId).ToHashSet();
        }
        
        // Get current user's likes for BookShelves
        var userBookShelfLikes = new HashSet<string>();
        if (bookShelfIds.Any())
        {
            var (likes, _) = await _unitOfWork.Likes.GetAllAsync(
                filter: l => l.UserId == userId && l.TargetType == "BookShelf" && bookShelfIds.Contains(l.TargetId));
            userBookShelfLikes = likes.Select(l => l.TargetId).ToHashSet();
        }
        
        // Get like counts for BookShelves
        var bookShelfLikeCounts = new Dictionary<string, int>();
        if (bookShelfIds.Any())
        {
            var (allBookShelfLikes, _) = await _unitOfWork.Likes.GetAllAsync(
                filter: l => l.TargetType == "BookShelf" && bookShelfIds.Contains(l.TargetId));
            bookShelfLikeCounts = allBookShelfLikes
                .GroupBy(l => l.TargetId)
                .ToDictionary(g => g.Key, g => g.Count());
        }

        // Combine all activities
        var feedItems = new List<FeedItemDto>();

        // Get like counts for quotes (from included Likes navigation property)
        var quoteLikeCounts = quotesList.ToDictionary(q => q.Id, q => q.Likes?.Count ?? 0);

        // Add quotes
        foreach (var quote in quotesList)
        {
            var user = await _userManager.FindByIdAsync(quote.CreatedByUserId);
            if (user != null)
            {
                var quoteDto = _mapper.Map<QuoteDto>(quote);
                // Set IsLiked based on current user's likes
                quoteDto.IsLiked = userLikes.Contains(quote.Id);
                quoteDto.LikesCount = quoteLikeCounts.GetValueOrDefault(quote.Id, 0);

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
                    
                    // Set CoverImageUrl using IBookImageService
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

        // Load all shelves and users upfront for better performance
        var shelfIdsToLoad = bookShelvesList.Select(bs => bs.ShelfId).Distinct().ToList();
        var shelvesDict = new Dictionary<string, Shelf>();
        if (shelfIdsToLoad.Any())
        {
            var (shelvesToLoad, _) = await _unitOfWork.Shelves.GetAllAsync(filter: s => shelfIdsToLoad.Contains(s.Id));
            foreach (var s in shelvesToLoad)
            {
                shelvesDict[s.Id] = s;
            }
        }

        foreach (var bookShelf in bookShelvesList)
        {
            // Defensive null check (query filters nulls, but this adds extra safety)
            if (bookShelf.Book == null)
            {
                _logger.LogWarning("Book is null for BookShelf BookId={BookId}, ShelfId={ShelfId}", 
                    bookShelf.BookId, bookShelf.ShelfId);
                continue;
            }

            // Ensure Author is loaded - if not, log and skip
            if (bookShelf.Book.Author == null)
            {
                _logger.LogWarning("Author is null for Book BookId={BookId} in BookShelf, skipping", bookShelf.BookId);
                continue;
            }

            if (!shelvesDict.TryGetValue(bookShelf.ShelfId, out var shelf))
            {
                _logger.LogWarning("Shelf not found for ShelfId={ShelfId}", bookShelf.ShelfId);
                continue;
            }

            var user = await _userManager.FindByIdAsync(shelf.UserId);
            if (user == null)
            {
                _logger.LogWarning("User not found for UserId={UserId}", shelf.UserId);
                continue;
            }

            // Direct access to bookShelf.Book - no dictionaries needed
            var bookDto = _mapper.Map<BookDto>(bookShelf.Book);

            // Set CoverImageUrl using IBookImageService
            bookDto.CoverImageUrl = _bookImageService.GetCoverImageUrl(
                bookShelf.Book.CoverImageUrl,
                bookShelf.Book.ISBN,
                bookShelf.Book.CoverImageBlobName
            );
            
            _logger.LogInformation("Adding BookAdded feed item: BookId={BookId}, Title={Title}, AuthorName={AuthorName}, ShelfName={ShelfName}", 
                bookShelf.BookId, bookDto.Title, bookDto.AuthorName, shelf.Name);
            
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
                LikesCount = bookShelfLikeCounts.GetValueOrDefault(bookShelfId, 0)
            });
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

