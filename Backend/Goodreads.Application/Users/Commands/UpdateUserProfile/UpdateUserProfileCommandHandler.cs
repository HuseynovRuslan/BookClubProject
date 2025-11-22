namespace Goodreads.Application.Users.Commands.UpdateUserProfile;
internal class UpdateUserProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand, Result>
{
    private readonly UserManager<User> _userManager;
    private readonly IUserContext _userContext;
    private readonly ILogger<UpdateUserProfileCommandHandler> _logger;

    public UpdateUserProfileCommandHandler(IUserContext userContext, UserManager<User> userManager, ILogger<UpdateUserProfileCommandHandler> logger)
    {
        _userContext = userContext;
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<Result> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            return Result.Fail(AuthErrors.Unauthorized);

        _logger.LogInformation("Updating profile for user: {UserId}", userId);

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            _logger.LogWarning("User not found: {UserId}", userId);
            return Result.Fail(UserErrors.NotFound(userId));
        }

        // Ignore Swagger default "string" values - only update if meaningful value provided
        if (!string.IsNullOrWhiteSpace(request.FirstName) && request.FirstName != "string")
            user.FirstName = request.FirstName;

        if (!string.IsNullOrWhiteSpace(request.LastName) && request.LastName != "string")
            user.LastName = request.LastName;

        if (!string.IsNullOrWhiteSpace(request.Bio) && request.Bio != "string")
            user.Bio = request.Bio;

        // WebsiteUrl: Update only if provided (not null)
        // If null in JSON, it means field was not sent, so don't update
        // If empty string, it means user wants to clear it, so set to null
        // Ignore Swagger default "string" value
        if (request.WebsiteUrl != null && request.WebsiteUrl != "string")
            user.WebsiteUrl = string.IsNullOrWhiteSpace(request.WebsiteUrl) ? null : request.WebsiteUrl;

        if (!string.IsNullOrWhiteSpace(request.Country) && request.Country != "string")
            user.Country = request.Country;

        if (request.DateOfBirth.HasValue)
            user.DateOfBirth = request.DateOfBirth.Value;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            _logger.LogError("Failed to update profile for user: {UserId}. Errors: {Errors}", userId, result.Errors);
            return Result.Fail(UserErrors.UpdateFailed(userId));
        }

        _logger.LogInformation("Successfully updated profile for user: {UserId}", userId);

        return Result.Ok();
    }
}

