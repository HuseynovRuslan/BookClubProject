using Goodreads.API.Common;
using Goodreads.API.Controllers;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.News.Commands.CreateNews;
using Goodreads.Application.News.Commands;
using Goodreads.Application.News.Queries.GetAllInformations;
using Goodreads.Application.News.Queries.GetInformationById;
using Goodreads.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;
using Goodreads.Application.News.Commands.MarkAsRead;
using Goodreads.Application.News.Commands.DeleteInformation;

[ApiController]
[Route("api/informations/[controller]")]
public class InformationController : BaseController
{
    [HttpPost("create-information")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> CreateInformation([FromForm] CreateInformationCommand command)
    {
        var result = await Sender.Send(command);
        return result.Match(
            id => CreatedAtAction(nameof(GetInformationById), new { id }, ApiResponse.Success("Info created successfully")),
            failure => CustomResults.Problem(failure));
    }

    [HttpGet("get-all-information")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var result = await Sender.Send(new GetAllInformationsQuery());
        return Ok(result);
    }

    [HttpGet("get-information-by-id/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetInformationById(string id)
    {
        var result = await Sender.Send(new GetInformationByIdQuery(id));
        return Ok(result);
    }

    [HttpPut("update-information")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> UpdateInformation([FromForm] UpdateInformationCommand command)
    {
        var result = await Sender.Send(command);
        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }

    [HttpPut("{id}/mark-as-read")]
    [Authorize] 
    public async Task<IActionResult> MarkInformationAsRead(string id)
    {
        var result = await Sender.Send(new MarkInformationAsReadCommand(id));

        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }

    [HttpDelete("delete-information/{id}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> DeleteInformation(string id)
    {
        var result = await Sender.Send(new DeleteInformationCommand(id));
        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }
}
