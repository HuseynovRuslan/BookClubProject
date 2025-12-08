using Goodreads.API.Common;
using Goodreads.Application.Authors.Commands.CreateAuthor;
using Goodreads.Application.Authors.Commands.DeleteAuthor;
using Goodreads.Application.Authors.Commands.UpdateAuthor;
using Goodreads.Application.Authors.Queries.GetAllAuthors;
using Goodreads.Application.Authors.Queries.GetAuthorById;
using Goodreads.Application.Books.Queries.GetBooksByAuthor;
using Goodreads.Application.Common;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using Goodreads.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;

namespace Goodreads.API.Controllers;

[ApiController]
[Route("api/[controller]/action")]
public class AuthorsController(ISender sender) : ControllerBase
{
    [HttpGet("get-all-authors")]


    public async Task<IActionResult> GetAuthors([FromQuery] QueryParameters parameters)
    {
        var result = await sender.Send(new GetAllAuthorsQuery(parameters));
        return Ok(result);
    }

    [HttpGet("get-author-by-id/{id}")]


    public async Task<IActionResult> GetAuthorById(string id)
    {
        var result = await sender.Send(new GetAuthorByIdQuery(id));
        return result.Match(
            author => Ok(ApiResponse<AuthorDto>.Success(author)),
            failure => CustomResults.Problem(failure));
    }

    [HttpPost("create-author")]
    [Authorize(Roles = Roles.Admin)]


    public async Task<IActionResult> CreateAuthor([FromForm] CreateAuthorCommand command)
    {
        var result = await sender.Send(command);
        return result.Match(
            id => CreatedAtAction(nameof(GetAuthorById), new { id }, ApiResponse.Success("Author created successfully")),
            failure => CustomResults.Problem(failure));
    }

    [HttpPut("update-author")]
    [Authorize(Roles = Roles.Admin)]


    public async Task<IActionResult> UpdateAuthor([FromForm] UpdateAuthorCommand command)
    {
        var result = await sender.Send(command);
        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }

    [HttpDelete("delete-author/{id}")]
    [Authorize(Roles = Roles.Admin)]


    public async Task<IActionResult> DeleteAuthor(string id)
    {
        var result = await sender.Send(new DeleteAuthorCommand(id));
        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }

    [HttpGet("{authorId}/books")]
    [EndpointSummary("Get books by author ID")]
    [ProducesResponseType(typeof(PagedResult<BookDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBooksByAuthor(string authorId, [FromQuery] QueryParameters parameters)
    {
        var result = await sender.Send(new GetBooksByAuthorQuery(authorId, parameters));
        return Ok(result);
    }
}

