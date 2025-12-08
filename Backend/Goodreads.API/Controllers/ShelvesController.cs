using Goodreads.API.Common;
using Goodreads.Application.Common;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using Goodreads.Application.Shelves.Commands.AddBookToShelf;
using Goodreads.Application.Shelves.Commands.CreateShelf;
using Goodreads.Application.Shelves.Commands.DeleteShelf;
using Goodreads.Application.Shelves.Commands.RemoveBookFromShelf;
using Goodreads.Application.Shelves.Commands.UpdateShelf;
using Goodreads.Application.Shelves.Queries.GetShelfById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;

namespace Goodreads.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShelvesController(ISender sender) : ControllerBase
{
    [HttpGet("get-shelf-by-id/{id}")]


    public async Task<IActionResult> GetShelfById(string id)
    {
        var result = await sender.Send(new GetShelfByIdQuery(id));
        return result.Match(
            shelf => Ok(ApiResponse<ShelfDto>.Success(shelf)),
            failure => CustomResults.Problem(failure));
    }

    [HttpPost("create-shelf")]
    [Authorize]


    public async Task<IActionResult> CreateShelf([FromBody] CreateShelfCommand command)
    {
        var result = await sender.Send(command);
        return result.Match(
            id => CreatedAtAction(nameof(GetShelfById), new { id }, ApiResponse.Success("Shelf created successfully")),
            failure => CustomResults.Problem(failure));
    }

    [HttpPut("update-shelf")]
    [Authorize]


    public async Task<IActionResult> UpdateShelf([FromBody] UpdateShelfCommand command)
    {
        var result = await sender.Send(command);
        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }

    [HttpDelete("delete-shelf/{id}")]
    [Authorize]


    public async Task<IActionResult> DeleteShelf(string id)
    {
        var result = await sender.Send(new DeleteShelfCommand(id));
        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }


    [HttpPost("add-book-to-shelf/{shelfId}/books/{bookId}")]
    [Authorize]




    public async Task<IActionResult> AddBookToShelf(string shelfId, string bookId)
    {
        var result = await sender.Send(new AddBookToShelfCommand(shelfId, bookId));
        return result.Match(
            () => Ok(),
            failure => CustomResults.Problem(failure));
    }

    [HttpDelete("remove-book-from-shelf/{shelfId}/books/{bookId}")]
    [Authorize]



    public async Task<IActionResult> RemoveBookFromShelf(string shelfId, string bookId)
    {
        var result = await sender.Send(new RemoveBookFromShelfCommand(shelfId, bookId));
        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }
}

