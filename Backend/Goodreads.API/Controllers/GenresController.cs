using Goodreads.API.Common;
using Goodreads.Application.Common;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using Goodreads.Application.Genres.Commands.CreateGenre;
using Goodreads.Application.Genres.Commands.DeleteGenre;
using Goodreads.Application.Genres.Commands.UpdateGenre;
using Goodreads.Application.Genres.Queries.GetAllGenres;
using Goodreads.Application.Genres.Queries.GetGenreById;
using Goodreads.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;

namespace Goodreads.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GenresController : BaseController
{
    [HttpGet("get-all-genres")]


    public async Task<IActionResult> GetAllGenres([FromQuery] QueryParameters parameters)
    {
        var result = await Sender.Send(new GetAllGenresQuery(parameters));
        return Ok(result);
    }

    [HttpGet("get-genre-by-id/{id}")]


    public async Task<IActionResult> GetGenreById(string id)
    {
        var result = await Sender.Send(new GetGenreByIdQuery(id));
        return result.Match(
            genre => Ok(ApiResponse<GenreDto>.Success(genre)),
            failure => CustomResults.Problem(failure));
    }

    [HttpPost("create-genre")]
    [Authorize(Roles = Roles.Admin)]


    public async Task<IActionResult> CreateGenre([FromBody] CreateGenreCommand command)
    {
        var result = await Sender.Send(command);
        return result.Match(
            id => CreatedAtAction(nameof(GetGenreById), new { id }, ApiResponse.Success("Genre created successfully")),
            failure => CustomResults.Problem(failure));
    }

    [HttpPut("update-genre")]
    [Authorize(Roles = Roles.Admin)]


    public async Task<IActionResult> UpdateGenre([FromBody] UpdateGenreCommand command)
    {
        var result = await Sender.Send(command);
        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }

    [HttpDelete("delete-genre/{id}")]
    [Authorize(Roles = Roles.Admin)]


    public async Task<IActionResult> DeleteGenre(string id)
    {
        var result = await Sender.Send(new DeleteGenreCommand(id));
        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }
}

