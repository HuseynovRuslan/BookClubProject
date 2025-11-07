using Goodreads.Application.Interfaces;
using MediatR;
using System.Security.Cryptography;
using System.Text;

public class LoginCommandHandler : IRequestHandler<LoginCommand, string>
{
    private readonly IUserRepository _repo;
    private readonly IJwtService _jwt;

    public LoginCommandHandler(IUserRepository repo, IJwtService jwt)
    {
        _repo = repo;
        _jwt = jwt;
    }

    public async Task<string> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _repo.GetByEmailAsync(request.Email);
        if (user == null)
            throw new Exception("User not found");

        // Hash incoming password
        var requestHash = HashPassword(request.Password);

        if (requestHash != user.PasswordHash)
            throw new Exception("Invalid password");

        return _jwt.GenerateToken(user);
    }

    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}
