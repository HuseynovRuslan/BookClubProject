public record ForgotPasswordCommand(string Email) : IRequest<Result<string>>;
