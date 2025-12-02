namespace Goodreads.Application.Books.Queries.GetBooksByGener;
public record GetBooksByGenerQuery(QueryParameters Parameters) : IRequest<PagedResult<BookDto>>;