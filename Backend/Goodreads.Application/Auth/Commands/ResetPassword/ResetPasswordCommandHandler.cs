using System.Web;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Result<string>>
{
    private readonly UserManager<User> _userManager;

    public ResetPasswordCommandHandler(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result<string>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);

        if (user == null)
            return Result<string>.Fail(AuthErrors.InvalidCredentials);

        var decodedToken = HttpUtility.UrlDecode(request.Token);
        var resetResult = await _userManager.ResetPasswordAsync(user, decodedToken, request.NewPassword);

        if (!resetResult.Succeeded)
        {
            return Result<string>.Fail(AuthErrors.Unauthorized);
        }

        return Result<string>.Ok("Password reset successfully.");
    }
}
