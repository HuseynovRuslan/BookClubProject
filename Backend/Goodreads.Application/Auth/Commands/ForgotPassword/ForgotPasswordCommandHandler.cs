using System.Net;
using Goodreads.Application.Common.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace Goodreads.Application.Auth.Commands.ForgotPassword;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, Result<string>>
{
    private readonly UserManager<User> _userManager;
    private readonly IEmailService _emailService;

    public ForgotPasswordCommandHandler(UserManager<User> userManager, IEmailService emailService)
    {
        _userManager = userManager;
        _emailService = emailService;
    }

    public async Task<Result<string>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return Result<string>.Fail(UserErrors.NotFound(request.Email));

        // Password reset token yaradılır
        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = WebUtility.UrlEncode(token);

        // Reset link
        var resetLink = $"https://localhost:7050/api/auth/reset-password?userId={user.Id}&token={encodedToken}";

        // Email göndər
        var subject = "🔐 BookVerse - Şifrənizi Sıfırlayın";
        var userName = user.UserName;
        var currentYear = DateTime.Now.Year;
        
        var body = $@"
<!DOCTYPE html>
<html lang=""az"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Şifrə Sıfırlama</title>
</head>
<body style=""margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);"">
    <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); min-height: 100vh;"">
        <tr>
            <td align=""center"" style=""padding: 40px 20px;"">
                <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" width=""650"" style=""background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 40px rgba(33, 150, 243, 0.25); overflow: hidden; border: 3px solid #2196f3;"">
                    <tr>
                        <td style=""background: linear-gradient(135deg, #1976d2 0%, #2196f3 50%, #42a5f5 100%); padding: 0; position: relative; height: 140px;"">
                            <div style=""position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(255,255,255,0.08) 15px, rgba(255,255,255,0.08) 30px);""></div>
                            <table width=""100%"" cellpadding=""0"" cellspacing=""0"">
                                <tr>
                                    <td align=""center"" style=""padding: 35px 20px; position: relative; z-index: 1;"">
                                        <div style=""font-size: 56px; margin-bottom: 12px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));"">🔒</div>
                                        <h1 style=""margin: 0; color: #ffffff; font-size: 34px; font-weight: 800; text-shadow: 2px 2px 6px rgba(0,0,0,0.3); letter-spacing: 1px; font-family: 'Segoe UI', sans-serif;"">BookVerse</h1>
                                        <p style=""margin: 10px 0 0 0; color: #e3f2fd; font-size: 15px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px;"">Təhlükəsizlik Mərkəzi</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 50px 40px; background: linear-gradient(to bottom, #ffffff 0%, #f5f9ff 100%);"">
                            <div style=""text-align: center; margin-bottom: 35px;"">
                                <div style=""display: inline-block; width: 100px; height: 100px; background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); border-radius: 50%; line-height: 100px; font-size: 50px; box-shadow: 0 8px 25px rgba(33, 150, 243, 0.4); border: 4px solid #e3f2fd;"">🛡️</div>
                            </div>
                            <h2 style=""margin: 0 0 20px 0; color: #1565c0; font-size: 26px; font-weight: 700; text-align: center; font-family: 'Segoe UI', sans-serif;"">Salam, {userName}!</h2>
                            <div style=""background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-left: 5px solid #2196f3; padding: 25px; margin: 25px 0; border-radius: 8px; box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);"">
                                <p style=""margin: 0; color: #1565c0; font-size: 16px; line-height: 1.8; text-align: center; font-weight: 500;"">
                                    <span style=""font-size: 28px; margin-right: 10px; vertical-align: middle;"">🔐</span>
                                    Şifrənizi sıfırlamaq üçün tələb göndərdiniz. Aşağıdakı düyməyə klik edərək yeni şifrə təyin edə bilərsiniz.
                                </p>
                            </div>
                            <div style=""text-align: center; margin: 45px 0;"">
                                <a href=""{resetLink}"" style=""display: inline-block; padding: 20px 50px; background: linear-gradient(135deg, #1976d2 0%, #2196f3 50%, #42a5f5 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 18px; box-shadow: 0 8px 25px rgba(33, 150, 243, 0.4); transition: all 0.3s; font-family: 'Segoe UI', sans-serif; letter-spacing: 0.5px; border: 2px solid #1565c0; text-transform: uppercase;"">🔑 Şifrəni Sıfırla</a>
                            </div>
                            <div style=""background: #fff3cd; border: 2px solid #ffc107; padding: 25px; margin: 30px 0; border-radius: 10px; box-shadow: 0 4px 12px rgba(255, 193, 7, 0.2);"">
                                <div style=""display: flex; align-items: center; margin-bottom: 15px;"">
                                    <div style=""font-size: 32px; margin-right: 15px;"">⏰</div>
                                    <div>
                                        <h3 style=""margin: 0; color: #856404; font-size: 18px; font-weight: 700;"">Vaxt Məhdudiyyəti</h3>
                                    </div>
                                </div>
                                <p style=""margin: 0; color: #856404; font-size: 14px; line-height: 1.7; font-weight: 500;"">
                                    Bu təhlükəsizlik linki yalnız <strong>24 saat</strong> ərzində etibarlıdır. Vaxtı keçdikdən sonra yenidən şifrə sıfırlama tələbi göndərməlisiniz.
                                </p>
                            </div>
                            <div style=""background: #f8f9fa; padding: 20px; margin: 25px 0; border-radius: 8px; border: 1px solid #dee2e6;"">
                                <p style=""margin: 0 0 12px 0; color: #495057; font-size: 13px; font-weight: 600; text-align: center;"">📋 Əgər düymə işləmirsə, linki kopyalayın:</p>
                                <div style=""background: #ffffff; padding: 15px; border-radius: 6px; border: 2px solid #2196f3;"">
                                    <p style=""margin: 0; color: #1976d2; font-size: 11px; word-break: break-all; font-family: 'Courier New', monospace; text-align: center; font-weight: 600;"">{resetLink}</p>
                                </div>
                            </div>
                            <div style=""margin-top: 35px; padding-top: 25px; border-top: 3px solid #e3f2fd;"">
                                <div style=""background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); padding: 20px; border-radius: 8px; border-left: 5px solid #f44336; box-shadow: 0 4px 12px rgba(244, 67, 54, 0.15);"">
                                    <div style=""display: flex; align-items: flex-start;"">
                                        <div style=""font-size: 24px; margin-right: 12px; margin-top: 2px;"">⚠️</div>
                                        <div>
                                            <p style=""margin: 0; color: #c62828; font-size: 13px; line-height: 1.7; font-weight: 600;"">
                                                <strong>Təhlükəsizlik Xəbərdarlığı:</strong> Əgər bu email-i siz istəməmisinizsə, bu mesajı nəzərə almayın və şifrənizi dəyişməyin. Hesabınızın təhlükəsizliyi üçün şübhəli fəaliyyət görsəniz, dərhal bizimlə əlaqə saxlayın.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 35px 40px; background: linear-gradient(135deg, #1565c0 0%, #1976d2 100%); text-align: center; border-top: 4px solid #42a5f5;"">
                            <p style=""margin: 0 0 12px 0; color: #e3f2fd; font-size: 15px; font-weight: 700; font-family: 'Segoe UI', sans-serif; letter-spacing: 1px;"">🔒 BookVerse Təhlükəsizlik Mərkəzi</p>
                            <p style=""margin: 0; color: #90caf9; font-size: 12px; font-weight: 500;"">© {currentYear} BookVerse. Bütün hüquqlar qorunur.</p>
                            <div style=""margin-top: 18px; padding-top: 18px; border-top: 1px solid rgba(227, 242, 253, 0.3);"">
                                <p style=""margin: 0; color: #bbdefb; font-size: 11px; font-style: italic; font-weight: 500;"">""Hesabınızın təhlükəsizliyi bizim üçün vacibdir""</p>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

        await _emailService.SendEmailAsync(user.Email!, subject, body);

        return Result<string>.Ok(resetLink);
    }
}
