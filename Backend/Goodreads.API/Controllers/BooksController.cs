using Goodreads.API.Common;
using Goodreads.Application.Books.Commands.AddGenersToBook;
using Goodreads.Application.Books.Commands.CreateBook;
using Goodreads.Application.Books.Commands.DeleteBook.DeleteBookCommand;
using Goodreads.Application.Books.Commands.RemoveGenrerFromBook;
using Goodreads.Application.Books.Commands.UpdateBook;



//using Goodreads.Application.Books.Commands.AddGenresToBook;
//using Goodreads.Application.Books.Commands.CreateBook;
//using Goodreads.Application.Books.Commands.DeleteBook.DeleteBookCommand;
//using Goodreads.Application.Books.Commands.RemoveGenreFromBook;
//using Goodreads.Application.Books.Commands.UpdateBook;
using Goodreads.Application.Books.Commands.UpdateBookStatus;
using Goodreads.Application.Books.Queries.GetAllBooks;
using Goodreads.Application.Books.Queries.GetBookById;
using Goodreads.Application.Books.Queries.GetBooksByGener;


//using Goodreads.Application.Books.Queries.GetBookById;
//using Goodreads.Application.Books.Queries.GetBooksByGenre;
using Goodreads.Application.Common;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using Goodreads.Application.Reviews.Queries.GetAllReviews;
using Goodreads.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;

namespace Goodreads.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : BaseController
{
    [HttpGet("get-all-books")]


    public async Task<IActionResult> GetAllBooks([FromQuery] QueryParameters parameters)
    {
        var result = await Sender.Send(new GetAllBooksQuery(parameters));
        return Ok(result);
    }

    [HttpGet("get-book-by-id/{id}")]
    [EndpointSummary("Get book by ID")]
    [ProducesResponseType(typeof(ApiResponse<BookDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBookById(string id)
    {
        var result = await Sender.Send(new GetBookByIdQuery(id));

        return result.Match(
            book => Ok(ApiResponse<BookDetailDto>.Success(book)),
            failure => CustomResults.Problem(failure)
        );
    }

    [HttpPost("create-book")]
    [Authorize(Roles = Roles.Admin)]


    public async Task<IActionResult> CreateBook([FromForm] CreateBookCommand command)
    {
        var result = await Sender.Send(command);
        return result.Match(
            id => CreatedAtAction(nameof(GetBookById), new { id }, ApiResponse.Success("Book created successfully")),
            failure => CustomResults.Problem(failure));
    }

    [HttpPut("update-book")]
    [Authorize(Roles = Roles.Admin)]


    public async Task<IActionResult> UpdateBook([FromForm] UpdateBookCommand command)
    {
        var result = await Sender.Send(command);
        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }

    [HttpDelete("delete-book/{id}")]
    [Authorize(Roles = Roles.Admin)]


    public async Task<IActionResult> DeleteBook(string id)
    {
        var result = await Sender.Send(new DeleteBookCommand(id));
        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }

    [Authorize]
    [HttpPost("{bookId}/genres")]


    public async Task<IActionResult> AddGenresToBook(string bookId, [FromBody] List<string> GenreIds)
    {
        var result = await Sender.Send(new AddGenersToBookCommand(bookId, GenreIds));
        return result.Match(
            () => Ok(),
            failure => CustomResults.Problem(failure));
    }

    [Authorize]
    [HttpDelete("{bookId}/genres/{genreId}")]


    public async Task<IActionResult> RemoveGenreFromBook(string bookId, string genreId)
    {
        var result = await Sender.Send(new RemoveGenerFromBookCommand(bookId, genreId));
        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }


    [HttpGet("by-genre")]


    public async Task<IActionResult> GetBooksByGenre([FromQuery] QueryParameters parameters)
    {
        var result = await Sender.Send(new GetBooksByGenerQuery(parameters));
        return Ok(result);
    }


    [Authorize]
    [HttpPost("{bookId}/status")]



    public async Task<IActionResult> UpdateBookStatus(string bookId, [FromQuery] string? targetShelfName)
    {
        var command = new UpdateBookStatusCommand(bookId, targetShelfName);
        var result = await Sender.Send(command);

        return result.Match(
             () => NoContent(),
             failure => CustomResults.Problem(failure));
    }

    [HttpGet("{bookId}/reviews")]
    [EndpointSummary("Get reviews for a book")]
    [ProducesResponseType(typeof(PagedResult<BookReviewDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetBookReviews(string bookId, [FromQuery] QueryParameters parameters)
    {
        var result = await Sender.Send(new GetAllReviewsQuery(parameters, null, bookId));
        return Ok(result);
    }

}
