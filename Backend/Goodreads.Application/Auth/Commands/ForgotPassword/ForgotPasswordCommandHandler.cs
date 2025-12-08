using System.Net.Mail;
using System.Web;
using MediatR;
using Microsoft.AspNetCore.Identity;
using SharedKernel;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, Result<string>>
{
    private readonly UserManager<User> _userManager;

    public ForgotPasswordCommandHandler(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result<string>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user == null)
            return Result<string>.Fail(AuthErrors.InvalidCredentials);

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = HttpUtility.UrlEncode(token);
        var resetLink = $"https://your-domain.com/reset-password?userId={user.Id}&token={encodedToken}";

        try
        {
            using var client = new SmtpClient("localhost", 25) 
            {
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress("no-reply@yourdomain.com", "Your App"),
                Subject = "Reset your password",
                IsBodyHtml = true,
                Body = $@"
                    <p>Salam {user.UserName},</p>
                    <p>?ifr?ni yenil?m?k üçün a?a??dak? link? klikl?yin:</p>
                    <p><a href='{resetLink}'>?ifr?ni yenil?</a></p>
                    <p>T???kkürl?r!</p>"
            };

            mailMessage.To.Add(user.Email);

            await client.SendMailAsync(mailMessage);
        }
        catch (Exception ex)
        {
            return Result<string>.Fail(AuthErrors.InvalidCredentials);
        }

        return Result<string>.Ok(resetLink);
    }
}
