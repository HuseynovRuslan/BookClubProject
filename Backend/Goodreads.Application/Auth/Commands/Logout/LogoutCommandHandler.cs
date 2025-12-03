namespace Goodreads.Application.Auth.Commands.Logout;
internal class LogoutCommandHandler : IRequestHandler<LogoutCommand, Result>
{
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IUserContext _userContext;
    private readonly ILogger<LogoutCommandHandler> _logger;

    public LogoutCommandHandler(IRefreshTokenRepository refreshTokenRepository, IUserContext userContext, ILogger<LogoutCommandHandler> logger)
    {
        _refreshTokenRepository = refreshTokenRepository;
        _userContext = userContext;
        _logger = logger;
    }
    public async Task<Result> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            return Result.Fail(AuthErrors.Unauthorized);

        var tokens = await _refreshTokenRepository.GetByUserIdAsync(userId);

        foreach (var token in tokens)
            token.IsRevoked = true;

        await _refreshTokenRepository.SaveChangesAsync();

        _logger.LogInformation("User {UserId} logged out successfully", userId);
        return Result.Ok();
    }
}

