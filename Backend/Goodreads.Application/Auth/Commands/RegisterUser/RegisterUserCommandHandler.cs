using System.Net;
using Microsoft.EntityFrameworkCore.Storage;

namespace Goodreads.Application.Auth.Commands.RegisterUser;

internal class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, Result<string>>
{
    private readonly UserManager<User> _userManager;
    private readonly IMapper _mapper;
    private readonly ILogger<RegisterUserCommandHandler> _logger;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;

    public RegisterUserCommandHandler(
        UserManager<User> userManager,
        IMapper mapper,
        ILogger<RegisterUserCommandHandler> logger,
        IEmailService emailService,
        IUnitOfWork unitOfWork)
    {
        _userManager = userManager;
        _mapper = mapper;
        _logger = logger;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<string>> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling RegisterUserCommand for user: {UserName}", request.UserName);

        if (await _userManager.FindByNameAsync(request.UserName) != null)
            return Result<string>.Fail(UserErrors.UsernameTaken);

        if (await _userManager.FindByEmailAsync(request.Email) != null)
            return Result<string>.Fail(UserErrors.EmailAlreadyRegistered);

        var user = _mapper.Map<User>(request);
        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
            return Result<string>.Fail(UserErrors.CreateUserFailed(result.Errors.First().Description));

        await _userManager.AddToRoleAsync(user, Roles.User);

        var defaultShelfs = DefaultShelves.All.Select(shelf => new Shelf
        {
            Name = shelf,
            UserId = user.Id,
            IsDefault = true
        }).ToList();
        await _unitOfWork.Shelves.AddRangeAsync(defaultShelfs);
        await _unitOfWork.SaveChangesAsync();

        // Email confirmation token
        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = WebUtility.UrlEncode(token);

        var confirmationLink = $"https://localhost:7050/api/auth/confirm-email?userId={user.Id}&token={encodedToken}";

        // Email göndər
        try
        {
            var subject = "📚 BookVerse - Hesabınızı Təsdiqləyin";
            var userName = user.UserName;
            var currentYear = DateTime.Now.Year;
            
            var body = $@"
<!DOCTYPE html>
<html lang=""az"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Email Təsdiqi</title>
</head>
<body style=""margin: 0; padding: 0; font-family: 'Georgia', 'Times New Roman', serif; background: linear-gradient(135deg, #f5f1e8 0%, #e8ddd4 100%);"">
    <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background: linear-gradient(135deg, #f5f1e8 0%, #e8ddd4 100%); min-height: 100vh;"">
        <tr>
            <td align=""center"" style=""padding: 40px 20px;"">
                <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" width=""650"" style=""background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 40px rgba(139, 69, 19, 0.2); overflow: hidden; border: 2px solid #d4a574;"">
                    <tr>
                        <td style=""background: linear-gradient(135deg, #8b4513 0%, #a0522d 50%, #cd853f 100%); padding: 0; position: relative; height: 120px;"">
                            <div style=""position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px);""></div>
                            <table width=""100%"" cellpadding=""0"" cellspacing=""0"">
                                <tr>
                                    <td align=""center"" style=""padding: 30px 20px; position: relative; z-index: 1;"">
                                        <div style=""font-size: 48px; margin-bottom: 10px;"">📚</div>
                                        <h1 style=""margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); letter-spacing: 2px;"">BookVerse</h1>
                                        <p style=""margin: 8px 0 0 0; color: #f5deb3; font-size: 14px; font-style: italic; font-family: 'Georgia', serif;"">Kitab sevənlərin klubu</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 50px 40px; background: linear-gradient(to bottom, #ffffff 0%, #faf8f5 100%);"">
                            <div style=""text-align: center; margin-bottom: 30px;"">
                                <div style=""display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #d4a574 0%, #cd853f 100%); border-radius: 50%; line-height: 80px; font-size: 40px; box-shadow: 0 4px 15px rgba(212, 165, 116, 0.4);"">✨</div>
                            </div>
                            <h2 style=""margin: 0 0 25px 0; color: #5c4033; font-size: 28px; font-weight: 700; text-align: center; font-family: 'Georgia', serif;"">Salam, {userName}!</h2>
                            <div style=""background: #fff8f0; border-left: 4px solid #d4a574; padding: 20px; margin: 25px 0; border-radius: 4px;"">
                                <p style=""margin: 0; color: #5c4033; font-size: 17px; line-height: 1.8; text-align: center; font-family: 'Georgia', serif;"">
                                    <span style=""font-size: 24px; margin-right: 8px;"">📖</span>
                                    BookVerse-a xoş gəlmisiniz! Kitab sevənlərin birgə səyahətinə başlamaq üçün hesabınızı aktivləşdirməyiniz lazımdır.
                                </p>
                            </div>
                            <div style=""text-align: center; margin: 40px 0;"">
                                <a href=""{confirmationLink}"" style=""display: inline-block; padding: 18px 45px; background: linear-gradient(135deg, #8b4513 0%, #a0522d 50%, #cd853f 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(139, 69, 19, 0.4); transition: all 0.3s; font-family: 'Georgia', serif; letter-spacing: 1px; border: 2px solid #654321;"">📚 Hesabı Təsdiqlə</a>
                            </div>
                            <div style=""background: linear-gradient(135deg, #f5f1e8 0%, #e8ddd4 100%); padding: 25px; margin: 30px 0; border-radius: 8px; border: 1px dashed #d4a574;"">
                                <p style=""margin: 0; color: #5c4033; font-size: 15px; line-height: 1.8; font-style: italic; text-align: center; font-family: 'Georgia', serif;"">
                                    <span style=""font-size: 20px; color: #8b4513;"">""</span>
                                    Kitablar insanın ən yaxın dostudur. Onlar sizə yeni dünyalar açır və məqsədinizə çatmağa kömək edir.
                                    <span style=""font-size: 20px; color: #8b4513;"">""</span>
                                </p>
                            </div>
                            <p style=""margin: 25px 0 0 0; color: #8b7355; font-size: 14px; line-height: 1.6; text-align: center;"">
                                Əgər düymə işləmirsə, aşağıdakı linki brauzerinizin ünvan sətrinə kopyalayın:
                            </p>
                            <div style=""background: #f5f1e8; padding: 15px; margin: 15px 0; border-radius: 6px; border: 1px solid #d4a574;"">
                                <p style=""margin: 0; color: #8b4513; font-size: 12px; word-break: break-all; font-family: monospace; text-align: center;"">{confirmationLink}</p>
                            </div>
                            <div style=""margin-top: 35px; padding-top: 25px; border-top: 2px solid #e8ddd4;"">
                                <div style=""background: #fff8f0; padding: 18px; border-radius: 6px; border-left: 4px solid #d4a574;"">
                                    <p style=""margin: 0; color: #8b7355; font-size: 13px; line-height: 1.7;"">
                                        <strong style=""color: #8b4513;"">⚠️ Xəbərdarlıq:</strong> Əgər bu email-i siz istəməmisinizsə, bu mesajı nəzərə almayın. Bu təsdiq linki 24 saat ərzində etibarlıdır.
                                    </p>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 30px 40px; background: linear-gradient(135deg, #5c4033 0%, #8b4513 100%); text-align: center; border-top: 3px solid #d4a574;"">
                            <p style=""margin: 0 0 10px 0; color: #f5deb3; font-size: 14px; font-weight: 600; font-family: 'Georgia', serif;"">📚 BookVerse - Kitab sevənlərin birgə səyahəti</p>
                            <p style=""margin: 0; color: #d4a574; font-size: 12px;"">© {currentYear} BookVerse. Bütün hüquqlar qorunur.</p>
                            <div style=""margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(245, 222, 179, 0.2);"">
                                <p style=""margin: 0; color: #cd853f; font-size: 11px; font-style: italic;"">""Kitab oxumaq - gələcəyi yaratmaqdır""</p>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

            await _emailService.SendEmailAsync(user.Email, subject, body);

            _logger.LogInformation("Confirmation email sent to: {Email}", user.Email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send confirmation email to {Email}", user.Email);
            return Result<string>.Fail(Error.Failure("1","Failed to send confirmation email."));
        }

        return Result<string>.Ok("Hesab yaradıldı, email göndərildi.");
    }
}
