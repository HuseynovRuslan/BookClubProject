using Goodreads.API.Common;
using Goodreads.Application.Common;
using Goodreads.Application.Common.Interfaces;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using Goodreads.Application.Reviews.Queries.GetAllReviews;
using Goodreads.Application.Shelves.Queries.GetUserShelves;
//using Goodreads.Application.Users.Commands.ChangePassword;
//using Goodreads.Application.Users.Commands.DeleteAccount;
using Goodreads.Application.Users.Commands.DeleteProfilePicture;
using Goodreads.Application.Users.Commands.UpdateProfilePicture;
using Goodreads.Application.Users.Commands.UpdateSocials;
using Goodreads.Application.Users.Commands.UpdateUserProfile;
using Goodreads.Application.Users.Queries.GetAllUsers;
using Goodreads.Application.Users.Queries.GetProfileByUsername;
using Goodreads.Application.Users.Queries.GetUserProfile;
using Goodreads.Application.Users.Queries.GetUserSocials;
//using Goodreads.Application.UserYearChallenges.Queries.GetAllUserYearChallenges;
//using Goodreads.Application.UserYearChallenges.Queries.GetUserYearChallenge;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;

namespace Goodreads.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(ISender sender, IUserContext userContext) : ControllerBase
{
    [HttpGet("get-current-user-profile")]
    [Authorize]

    public async Task<IActionResult> GetCurrentUserProfile()
    {
        var result = await sender.Send(new GetUserProfileQuery());

        return result.Match(
               profile => Ok(ApiResponse<UserProfileDto>.Success(profile)),
               failure => CustomResults.Problem(failure));
    }

    [HttpGet("get-user-social-links")]
    [Authorize]

    public async Task<IActionResult> GetUserSocialLinks()
    {
        var result = await sender.Send(new GetUserSocialsQuery());
        return result.Match(
            socials => Ok(ApiResponse<SocialDto>.Success(socials)),
            failure => CustomResults.Problem(failure));
    }

    [HttpPut("update-user-social-links")]
    [Authorize]

    public async Task<IActionResult> UpdateUserSocialLinks([FromBody] UpdateSocialsCommand command)
    {
        var result = await sender.Send(command);
        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }

    [HttpPut("update-user-profile")]
    [Authorize]

    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileCommand command)
    {
        var result = await sender.Send(command);
        return result.Match(
          () => NoContent(),
          failure => CustomResults.Problem(failure));
    }

    //[HttpDelete("me")]
    //[Authorize]
    //[EndpointSummary("Delete current user account")]
    //public async Task<IActionResult> DeleteAccount()
    //{
    //    var result = await sender.Send(new DeleteAccountCommand());
    //    return result.Match(
    //        () => NoContent(),
    //        failure => CustomResults.Problem(failure));
    //}

    [HttpPatch("update-profile-picture")]
    [Authorize]

    public async Task<IActionResult> UpdateProfilePicture([FromForm] UpdateProfilePictureCommand command)
    {
        var result = await sender.Send(command);
        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }

    [HttpDelete("delete-profile-picture")]
    [Authorize]

    public async Task<IActionResult> DeleteProfilePicture()
    {
        var result = await sender.Send(new DeleteProfilePictureCommand());
        return result.Match(
            () => NoContent(),
            failure => CustomResults.Problem(failure));
    }

    //[HttpPost("me/change-password")]
    //[Authorize]
    //[EndpointSummary("Change current user password")]
    //public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordCommand command)
    //{
    //    var result = await sender.Send(command);
    //    return result.Match(
    //        () => NoContent(),
    //        failure => CustomResults.Problem(failure));
    //    
    //}

    [HttpGet("get-user-profile-by-username/{username}")]

    public async Task<IActionResult> GetUserProfileByUsername(string username)
    {
        var result = await sender.Send(new GetProfileByUsernameQuery(username));

        return result.Match(
           profile => Ok(ApiResponse<UserProfileDto>.Success(profile)),
           failure => CustomResults.Problem(failure));
    }

    [HttpGet("get-all-users")]

    public async Task<IActionResult> GetAllUsers([FromQuery] QueryParameters parameters)
    {
        var result = await sender.Send(new GetAllUsersQuery(parameters));
        return Ok(result);
    }

    [HttpGet("get-current-user-shelves")]
    [Authorize]

    public async Task<IActionResult> GetCurrentUserShelves([FromQuery] QueryParameters parameters, string? Shelf)
    {
        var userId = userContext.UserId;
        if (userId is null)
            return Unauthorized();

        var result = await sender.Send(new GetUserShelvesQuery(userId, parameters, Shelf));
        return Ok(result);
    }

    //[HttpGet("{userId}/shelves")]
    //[EndpointSummary("Get shelves for a specific user by ID")]
    //public async Task<IActionResult> GetUserShelves(string userId, [FromQuery] QueryParameters parameters, string? Shelf)
    //{
    //    var result = await sender.Send(new GetUserShelvesQuery(userId, parameters, Shelf));
    //    return Ok(result);
    //}


    //[HttpGet("me/yearlychallenges")]
    //[Authorize]
    //[EndpointSummary("Get current user's yearly challenges")]
    //public async Task<IActionResult> GetMyYearlyChallenges([FromQuery] QueryParameters parameters, [FromQuery] int? year)
    //{
    //    var userId = userContext.UserId;
    //    var result = await sender.Send(new GetAllUserYearChallengesQuery(userId, parameters, year));
    //    return Ok(result);
    //}

    //[HttpGet("me/yearlychallenges/{year:int}")]
    //[Authorize]
    //[EndpointSummary("Get details of a specific yearly")]
    //public async Task<IActionResult> GetMyYearlyChallengeDetails(int year)
    //{
    //    var userId = userContext.UserId;
    //    var result = await sender.Send(new GetUserYearChallengeQuery(userId, year));
    //    return result.Match(
    //        challenge => Ok(ApiResponse<UserYearChallengeDetailsDto>.Success(challenge)),
    //        failure => CustomResults.Problem(failure)
    //    );
    //}

    //[HttpGet("{userId}/reviews/")]
    //[EndpointSummary("Get reviews for a user")]
    //public async Task<IActionResult> GetUserReviews(string userId, [FromQuery] QueryParameters parameters)
    //{
    //    var result = await sender.Send(new GetAllReviewsQuery(parameters, userId, null));
    //    return Ok(result);
    //}

    [HttpGet("get-current-user-reviews")]
    [Authorize]

    public async Task<IActionResult> GetCurrentUserReviews([FromQuery] QueryParameters parameters)
    {
        var userId = userContext.UserId;
        if (userId is null)
            return Unauthorized();
        var result = await sender.Send(new GetAllReviewsQuery(parameters, userId, null));
        return Ok(result);
    }


}
