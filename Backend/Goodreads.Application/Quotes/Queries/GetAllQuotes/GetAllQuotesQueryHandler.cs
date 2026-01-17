using System.Linq.Expressions;
using Microsoft.AspNetCore.Identity;
using Goodreads.Domain.Entities;
using Goodreads.Application.Common.Interfaces;

namespace Goodreads.Application.Quotes.Queries.GetAllQuotes;
public class GetAllQuotesQueryHandler : IRequestHandler<GetAllQuotesQuery, PagedResult<QuoteDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<GetAllQuotesQueryHandler> _logger;
    private readonly UserManager<User> _userManager;
    private readonly IUserContext _userContext;

    public GetAllQuotesQueryHandler(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<GetAllQuotesQueryHandler> logger,
        UserManager<User> userManager,
        IUserContext userContext)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
        _userManager = userManager;
        _userContext = userContext;
    }

    public async Task<PagedResult<QuoteDto>> Handle(GetAllQuotesQuery request, CancellationToken cancellationToken)
    {
        var p = request.Parameters;
        Expression<Func<Quote, bool>> filter = q =>
            (string.IsNullOrEmpty(p.Query) || q.Text.Contains(p.Query)) &&
            (string.IsNullOrEmpty(request.Tag) || q.Tags.Any(t => t == request.Tag)) &&
            (string.IsNullOrEmpty(request.UserId) || q.CreatedByUserId == request.UserId) &&
            (string.IsNullOrEmpty(request.AuthorId) || q.AuthorId == request.AuthorId) &&
            (string.IsNullOrEmpty(request.BookId) || q.BookId == request.BookId);

        var (quotes, count) = await _unitOfWork.Quotes.GetAllAsync(
            filter: filter,
            includes: new[] { "Likes" },
            sortColumn: p.SortColumn,
            sortOrder: p.SortOrder,
            pageNumber: p.PageNumber,
            pageSize: p.PageSize
        );

        var quotesList = quotes.ToList();

        // Get unique book IDs and user IDs
        var bookIds = quotesList.Where(q => !string.IsNullOrEmpty(q.BookId)).Select(q => q.BookId).Distinct().ToList();
        var userIds = quotesList.Select(q => q.CreatedByUserId).Distinct().ToList();

        // Fetch books with authors (if not already included)
        var books = new Dictionary<string, Book>();
        if (bookIds.Any())
        {
            var (bookResults, _) = await _unitOfWork.Books.GetAllAsync(
                filter: b => bookIds.Contains(b.Id),
                includes: new[] { "Author" }
            );
            foreach (var book in bookResults)
            {
                books[book.Id] = book;
            }
        }

        // Fetch users
        var users = new Dictionary<string, User>();
        foreach (var userId in userIds)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user != null)
            {
                users[userId] = user;
            }
        }

        // Get current user ID for like checking
        var currentUserId = _userContext.UserId;

        // Get all quote IDs for like checking
        var quoteIds = quotesList.Select(q => q.Id).ToList();
        var userLikes = new HashSet<string>();
        
        if (!string.IsNullOrEmpty(currentUserId) && quoteIds.Any())
        {
            var (likes, _) = await _unitOfWork.QuoteLikes.GetAllAsync(
                filter: l => l.UserId == currentUserId && quoteIds.Contains(l.QuoteId));
            userLikes = likes.Select(l => l.QuoteId).ToHashSet();
        }

        // Map quotes to DTOs with book and user info
        var dtoList = new List<QuoteDto>();
        foreach (var quote in quotesList)
        {
            var quoteDto = _mapper.Map<QuoteDto>(quote);
            
            // Set IsLiked based on current user's likes
            quoteDto.IsLiked = userLikes.Contains(quote.Id);
            
            if (!string.IsNullOrEmpty(quote.BookId) && books.TryGetValue(quote.BookId, out var book))
            {
                quoteDto.Book = _mapper.Map<BookDto>(book);
            }
            
            if (users.TryGetValue(quote.CreatedByUserId, out var user))
            {
                quoteDto.User = _mapper.Map<UserDto>(user);
            }
            
            dtoList.Add(quoteDto);
        }

        var pagedResult = PagedResult<QuoteDto>.Create(dtoList, p.PageNumber, p.PageSize, count);

        return pagedResult;
    }
}

