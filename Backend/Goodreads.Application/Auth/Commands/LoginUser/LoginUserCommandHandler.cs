using System.IdentityModel.Tokens.Jwt;
using Goodreads.Application.Common.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace Goodreads.Application.Auth.Commands.LoginUser;

internal class LoginUserCommandHandler : IRequestHandler<LoginUserCommand, Result<AuthResultDto>>
{
    private readonly UserManager<User> _userManager;
    private readonly ILogger<LoginUserCommandHandler> _logger;
    private readonly ITokenProvider _tokenProvider;

    public LoginUserCommandHandler(
        UserManager<User> userManager,
        ILogger<LoginUserCommandHandler> logger,
        ITokenProvider tokenProvider)
    {
        _userManager = userManager;
        _logger = logger;
        _tokenProvider = tokenProvider;
    }

    public async Task<Result<AuthResultDto>> Handle(LoginUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.UsernameOrEmail);

        if (user == null)
            user = await _userManager.FindByNameAsync(request.UsernameOrEmail);

        if (user == null)
            return Result<AuthResultDto>.Fail(AuthErrors.InvalidCredentials);

        // Password yoxlanılır
        var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!passwordValid)
            return Result<AuthResultDto>.Fail(AuthErrors.InvalidCredentials);

        // 🔹 Email təsdiqlənib yoxlanılır
        if (!user.EmailConfirmed)
            return Result<AuthResultDto>.Fail(Error.Failure("2", "Accound isn't confirmed. check your Email"));

        // Rol yoxlanılır və əlavə edilir
        var userRoles = await _userManager.GetRolesAsync(user);
        if (!userRoles.Any())
        {
            await _userManager.AddToRoleAsync(user, Roles.User);
        }

        // Token yaradılır
        var accessToken = await _tokenProvider.GenerateAccessTokenAsync(user);
        var jwtToken = new JwtSecurityTokenHandler().ReadJwtToken(accessToken);
        var refreshToken = await _tokenProvider.GenerateAndStoreRefreshTokenAsync(user, jwtToken.Id);

        var authResult = new AuthResultDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
        };

        _logger.LogInformation("User {Email} logged in successfully.", request.UsernameOrEmail);

        return Result<AuthResultDto>.Ok(authResult);
    }
}
