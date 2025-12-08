public record ResetPasswordCommand(string UserId, string Token, string NewPassword) : IRequest<Result<string>>;
