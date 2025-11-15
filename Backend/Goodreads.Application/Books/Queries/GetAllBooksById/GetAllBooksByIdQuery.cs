namespace Goodreads.Application.Books.Queries.GetBookById
{
    public record GetBookByIdQuery(string Id) : IRequest<ApiResponse<BookDto>>
    {

    }
}
