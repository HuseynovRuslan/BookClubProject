using Goodreads.API.Common;
using Goodreads.Application.Books.Commands.DeleteBook.DeleteBookCommand;
using Goodreads.Application.Books.Queries.GetAllBooks;
using Goodreads.Application.Common;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using Goodreads.Application.Quotes.Commands.DeleteQuote;
using Goodreads.Application.Reviews.Commands.DeleteReview;
using Goodreads.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;

namespace Goodreads.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.Admin)]
public class AdminController : BaseController
{
   
    [HttpGet("books")]
    public async Task<IActionResult> GetAllBooks([FromQuery] QueryParameters parameters)
    {
        var result = await Sender.Send(new GetAllBooksQuery(parameters));
        return Ok(result);
    }

    [HttpDelete("books/{id}")]
    public async Task<IActionResult> DeleteBook(string id)
    {
        var result = await Sender.Send(new DeleteBookCommand(id));
        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }

   
    [HttpDelete("quotes/{id}")]
    public async Task<IActionResult> DeleteQuote(string id)
    {
        var result = await Sender.Send(new DeleteQuoteCommand(id));
        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }

    
    [HttpDelete("reviews/{id}")]
    public async Task<IActionResult> DeleteReview(string id)
    {
        var result = await Sender.Send(new DeleteReviewCommand(id));
        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }
}

