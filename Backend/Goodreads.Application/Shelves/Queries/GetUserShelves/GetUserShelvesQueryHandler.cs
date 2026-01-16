using System.Linq.Expressions;
using Goodreads.Application.Common.Interfaces;

namespace Goodreads.Application.Shelves.Queries.GetUserShelves;
internal class GetUserShelvesQueryHandler : IRequestHandler<GetUserShelvesQuery, PagedResult<ShelfDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<GetUserShelvesQueryHandler> _logger;
    private readonly IBookImageService _bookImageService;

    public GetUserShelvesQueryHandler(IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<GetUserShelvesQueryHandler> logger,
        IBookImageService bookImageService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
        _bookImageService = bookImageService;
    }

    public async Task<PagedResult<ShelfDto>> Handle(GetUserShelvesQuery request, CancellationToken cancellationToken)
    {
        var p = request.Parameters;
        Expression<Func<Shelf, bool>> filter = s => s.UserId == request.UserId &&
            (string.IsNullOrEmpty(request.Shelf) || s.Name == request.Shelf);

        var (shelves, totalCount) = await _unitOfWork.Shelves.GetAllAsync(
            filter: filter,
            includes: new[] { "BookShelves.Book.Author", "BookShelves.Book.BookGenres.Genre" },
            sortColumn: p.SortColumn,
            sortOrder: p.SortOrder,
            pageNumber: p.PageNumber,
            pageSize: p.PageSize
        );

        _logger.LogInformation("Retrieved {Count} shelves for user {UserId} with shelf filter '{Shelf}'", totalCount, request.UserId, request.Shelf);

        var dtoList = _mapper.Map<List<ShelfDto>>(shelves);
        
        // Set CoverImageUrl for each book using IBookImageService
        foreach (var shelf in shelves)
        {
            var shelfDto = dtoList.FirstOrDefault(s => s.Id == shelf.Id);
            if (shelfDto != null)
            {
                foreach (var bookShelf in shelf.BookShelves)
                {
                    var bookDto = shelfDto.Books.FirstOrDefault(b => b.Id == bookShelf.Book.Id);
                    if (bookDto != null && bookShelf.Book != null)
                    {
                        bookDto.CoverImageUrl = _bookImageService.GetCoverImageUrl(
                            bookShelf.Book.CoverImageUrl,
                            bookShelf.Book.ISBN,
                            bookShelf.Book.CoverImageBlobName
                        );
                    }
                }
            }
        }
        
        return PagedResult<ShelfDto>.Create(dtoList, p.PageNumber, p.PageSize, totalCount);
    }
}

