using Goodreads.Application.Common.Extensions;
using Goodreads.Application.Common.Interfaces;
using Goodreads.Application.Feed.Queries.GetFeed;
using Goodreads.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Goodreads.Application.Common.Exceptions;

namespace Goodreads.Application.Feed.Queries.GetUserFeed;

public class GetUserFeedQueryHandler : IRequestHandler<GetUserFeedQuery, PagedResult<FeedItemDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly UserManager<User> _userManager;
    private readonly IMapper _mapper;
    private readonly ILogger<GetUserFeedQueryHandler> _logger;
    private readonly IBookImageService _bookImageService;
    private readonly IApplicationDbContext _context;

    public GetUserFeedQueryHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        UserManager<User> userManager,
        IMapper mapper,
        ILogger<GetUserFeedQueryHandler> logger,
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

    public async Task<PagedResult<FeedItemDto>> Handle(GetUserFeedQuery request, CancellationToken cancellationToken)
    {
        var targetUserId = request.TargetUserId;
        if (string.IsNullOrEmpty(targetUserId))
            throw new ArgumentException("Target user ID cannot be null or empty");

      
        var targetUser = await _userManager.FindByIdAsync(targetUserId);
        if (targetUser == null)
            throw new NotFoundException("User", targetUserId);

    
        var currentUserId = _userContext.UserId;

        var (quotes, _) = await _unitOfWork.Quotes
            .GetAllAsync(
                filter: q => q.CreatedByUserId == targetUserId,
                includes: new[] { "Likes" });
        
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

        var (reviews, ___) = await _unitOfWork.BookReviews
            .GetAllAsync(
                filter: r => r.UserId == targetUserId,
                includes: new[] { "Book", "User" });
        
        var reviewsList = reviews.ToList();
        var reviewIds = reviewsList.Select(r => r.Id).ToList();
        
        
        var userReviewLikes = new HashSet<string>();
        if (currentUserId != null && reviewIds.Any())
        {
            var (likes, _) = await _unitOfWork.Likes.GetAllAsync(
                filter: l => l.UserId == currentUserId && l.TargetType == "Review" && reviewIds.Contains(l.TargetId));
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

      
        var (shelves, ____) = await _unitOfWork.Shelves
            .GetAllAsync(filter: s => s.UserId == targetUserId);
        
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
        
        _logger.LogInformation("Fetched {Count} bookShelves for user feed", bookShelvesList.Count);

     
        var bookShelfIds = bookShelvesList.Select(bs => $"{bs.BookId}-{bs.ShelfId}").ToList();
        
       
        var quoteIds = quotesList.Select(q => q.Id).ToList();
        var userLikes = new HashSet<string>();
        
        if (currentUserId != null && quoteIds.Any())
        {
            var (likes, _) = await _unitOfWork.QuoteLikes.GetAllAsync(
                filter: l => l.UserId == currentUserId && quoteIds.Contains(l.QuoteId));
            userLikes = likes.Select(l => l.QuoteId).ToHashSet();
        }
        
       
        var userBookShelfLikes = new HashSet<string>();
        if (currentUserId != null && bookShelfIds.Any())
        {
            var (likes, _) = await _unitOfWork.Likes.GetAllAsync(
                filter: l => l.UserId == currentUserId && l.TargetType == "BookShelf" && bookShelfIds.Contains(l.TargetId));
            userBookShelfLikes = likes.Select(l => l.TargetId).ToHashSet();
        }
        
        var bookShelfLikeCounts = new Dictionary<string, int>();
        if (bookShelfIds.Any())
        {
            var (allBookShelfLikes, _) = await _unitOfWork.Likes.GetAllAsync(
                filter: l => l.TargetType == "BookShelf" && bookShelfIds.Contains(l.TargetId));
            bookShelfLikeCounts = allBookShelfLikes
                .GroupBy(l => l.TargetId)
                .ToDictionary(g => g.Key, g => g.Count());
        }

        var feedItems = new List<FeedItemDto>();

        var quoteLikeCounts = quotesList.ToDictionary(q => q.Id, q => q.Likes?.Count ?? 0);

        foreach (var quote in quotesList)
        {
            var quoteDto = _mapper.Map<QuoteDto>(quote);
            quoteDto.IsLiked = currentUserId != null && userLikes.Contains(quote.Id);
            quoteDto.LikesCount = quoteLikeCounts.GetValueOrDefault(quote.Id, 0);

            var feedItem = new FeedItemDto
            {
                Id = quote.Id,
                ActivityType = "Quote",
                CreatedAt = quote.CreatedAt,
                User = _mapper.Map<UserDto>(targetUser),
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

        foreach (var review in reviewsList)
        {
            var reviewDto = _mapper.Map<BookReviewDto>(review);
            reviewDto.IsLiked = currentUserId != null && userReviewLikes.Contains(review.Id);
            reviewDto.LikesCount = reviewLikeCounts.GetValueOrDefault(review.Id, 0);
            
            feedItems.Add(new FeedItemDto
            {
                Id = review.Id,
                ActivityType = "Review",
                CreatedAt = review.CreatedAt,
                User = _mapper.Map<UserDto>(targetUser),
                Review = reviewDto
            });
        }

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
            if (bookShelf.Book == null)
            {
                _logger.LogWarning("Book is null for BookShelf BookId={BookId}, ShelfId={ShelfId}", 
                    bookShelf.BookId, bookShelf.ShelfId);
                continue;
            }

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

            var bookDto = _mapper.Map<BookDto>(bookShelf.Book);

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
                User = _mapper.Map<UserDto>(targetUser),
                Book = bookDto,
                ShelfName = shelf.Name,
                BookShelfId = bookShelfId,
                IsLiked = currentUserId != null && userBookShelfLikes.Contains(bookShelfId),
                LikesCount = bookShelfLikeCounts.GetValueOrDefault(bookShelfId, 0)
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

