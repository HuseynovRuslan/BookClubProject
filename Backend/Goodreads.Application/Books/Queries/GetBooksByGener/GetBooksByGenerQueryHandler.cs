using System.Linq.Expressions;

namespace Goodreads.Application.Books.Queries.GetBooksByGener;
internal class GetBooksByGenerQueryHandelr : IRequestHandler<GetBooksByGenerQuery, PagedResult<BookDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<GetBooksByGenerQueryHandelr> _logger;

    public GetBooksByGenerQueryHandelr(IUnitOfWork unitOfWork, IMapper mapper, ILogger<GetBooksByGenerQueryHandelr> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<PagedResult<BookDto>> Handle(GetBooksByGenerQuery request, CancellationToken cancellationToken)
    {
        var p = request.Parameters;
        _logger.LogInformation("Getting All Books for Genre: {Genre}", p.Query);

        if (string.IsNullOrWhiteSpace(p.Query))
        {
            _logger.LogWarning("Genre query parameter is empty");
            return PagedResult<BookDto>.Create(new List<BookDto>(), p.PageNumber, p.PageSize, 0);
        }

        // Case-insensitive genre name filter
        var genreQuery = p.Query.ToLower().Trim();
        Expression<Func<Book, bool>> filter = b => b.BookGenres.Any(bg => bg.Genre.Name.ToLower() == genreQuery);

        string[] includes = new[] { "Author", "BookGenres.Genre" };

        var (books, totalCount) = await _unitOfWork.Books.GetAllAsync(
            filter: filter,
            includes: includes,
            sortColumn: p.SortColumn,
            sortOrder: p.SortOrder,
            pageNumber: p.PageNumber,
            pageSize: p.PageSize
        );

        var bookDtos = _mapper.Map<List<BookDto>>(books);

        var pagedResult = PagedResult<BookDto>.Create(bookDtos, p.PageNumber, p.PageSize, totalCount);

        _logger.LogInformation("Found {Count} books for genre: {Genre}", totalCount, p.Query);
        return pagedResult;
    }
}