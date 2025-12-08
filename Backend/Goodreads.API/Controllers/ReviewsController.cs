using Goodreads.API.Common;
using Goodreads.Application.Common;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using Goodreads.Application.Reviews.Commands.CreateBookReview;
using Goodreads.Application.Reviews.Queries.GetReviewById;
using Goodreads.Application.Reviews.Queries.GetAllReviews;
    
    

using Goodreads.Application.Reviews.Commands.DeleteReview;
using Goodreads.Application.Reviews.Commands.UpdateReview;
using Goodreads.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;

namespace Goodreads.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController(ISender sender) : ControllerBase
{
    [HttpGet("get-all-reviews")]


    public async Task<IActionResult> GetAllReviews([FromQuery] QueryParameters parameters, [FromQuery] string? userId = null, [FromQuery(Name = "bookId")] string? bookid = null)
    {
        var result = await sender.Send(new GetAllReviewsQuery(parameters, userId, bookid));
        return Ok(result);
    }

    [HttpGet("get-review-by-id/{id}")]


    public async Task<IActionResult> GetReviewById(string id)
    {
        var result = await sender.Send(new GetReviewByIdQuery(id));
        return result.Match(
            review => Ok(ApiResponse<BookReviewDto>.Success(review)),
            error => CustomResults.Problem(error)
        );
    }

    [HttpPost("create-book-review")]
    [Authorize(Roles = Roles.User)]


    public async Task<IActionResult> CreateBookReview([FromBody] CreateReviewCommand command)
    {
        var result = await sender.Send(command);
        return result.Match(
            reviewId => CreatedAtAction(nameof(GetReviewById), new { id = reviewId }, ApiResponse<string>.Success(reviewId)),
            error => CustomResults.Problem(error)
        );
    }

    [HttpPut("update-review/{reviewId}")]
    [Authorize]


    public async Task<IActionResult> UpdateReview(string reviewId, [FromBody] UpdateReviewRequest request)
    {
        var result = await sender.Send(new UpdateReviewCommand(reviewId, request.Rating, request.ReviewText));
        return result.Match(
            () => NoContent(),
            error => CustomResults.Problem(error)
        );
    }

    [HttpDelete("delete-review/{reviewId}")]
    [Authorize]


    public async Task<IActionResult> DeleteReview(string reviewId)
    {
        var result = await sender.Send(new DeleteReviewCommand(reviewId));
        return result.Match(
            () => NoContent(),
            error => CustomResults.Problem(error));
    }

}
