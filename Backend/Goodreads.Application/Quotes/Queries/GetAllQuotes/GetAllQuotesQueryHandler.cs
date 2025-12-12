using System.Linq.Expressions;
using Microsoft.AspNetCore.Identity;
using Goodreads.Domain.Entities;

namespace Goodreads.Application.Quotes.Queries.GetAllQuotes;
public class GetAllQuotesQueryHandler : IRequestHandler<GetAllQuotesQuery, PagedResult<QuoteDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<GetAllQuotesQueryHandler> _logger;
    private readonly UserManager<User> _userManager;

    public GetAllQuotesQueryHandler(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<GetAllQuotesQueryHandler> logger,
        UserManager<User> userManager)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
        _userManager = userManager;
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

        // Convert to list for easier manipulation
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

        // Map quotes to DTOs with book and user info
        var dtoList = new List<QuoteDto>();
        foreach (var quote in quotesList)
        {
            var quoteDto = _mapper.Map<QuoteDto>(quote);
            
            // Add book info if available
            if (!string.IsNullOrEmpty(quote.BookId) && books.TryGetValue(quote.BookId, out var book))
            {
                quoteDto.Book = _mapper.Map<BookDto>(book);
            }
            
            // Add user info if available
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

