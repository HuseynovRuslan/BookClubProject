using FluentEmail.Core;
using Goodreads.Application.Common.Interfaces;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace Goodreads.Infrastructure.Services.EmailService;

public class EmailService : IEmailService
{
    private readonly IFluentEmail _fluentEmail;
    private readonly EmailSettings _emailSettings;
    private readonly SendGridClient? _sendGridClient;

    // Brand Colors - Matching Frontend Stone Palette
    private const string PrimaryColor = "#1c1917";      // Stone 900
    private const string PrimaryLightColor = "#292524"; // Stone 800
    private const string AccentColor = "#f59e0b";       // Amber 500
    private const string AccentLightColor = "#fbbf24";  // Amber 400
    private const string TextDarkColor = "#1c1917";     // Stone 900
    private const string TextMutedColor = "#57534e";    // Stone 600
    private const string TextLightColor = "#a8a29e";    // Stone 400
    private const string BackgroundColor = "#fafaf9";   // Stone 50
    private const string CardBgColor = "#f5f5f4";       // Stone 100
    private const string BorderColor = "#e7e5e4";       // Stone 200

    public EmailService(IFluentEmail fluentEmail, IOptions<EmailSettings> emailSettings)
    {
        _fluentEmail = fluentEmail;
        _emailSettings = emailSettings.Value;

        if (_emailSettings.UseSendGrid && !string.IsNullOrWhiteSpace(_emailSettings.SendGridApiKey))
        {
            _sendGridClient = new SendGridClient(_emailSettings.SendGridApiKey);
        }
    }

    #region Public Methods

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        await SendAsync(to, subject, body);
    }

    public async Task SendVerificationEmailAsync(string to, string userName, string confirmationLink)
    {
        var subject = "Verify Your Email - BookClub";
        var body = GetVerificationEmailTemplate(confirmationLink, userName);
        await SendAsync(to, subject, body);
    }

    public async Task SendPasswordResetEmailAsync(string to, string userName, string resetLink)
    {
        var subject = "Reset Your Password - BookClub";
        var body = GetPasswordResetEmailTemplate(resetLink, userName);
        await SendAsync(to, subject, body);
    }

    #endregion

    #region Private Send Methods

    private async Task SendAsync(string to, string subject, string body)
    {
        if (_sendGridClient != null)
        {
            await SendViaSendGridAsync(to, subject, body);
        }
        else
        {
            await SendViaSmtpAsync(to, subject, body);
        }
    }

    private async Task SendViaSendGridAsync(string to, string subject, string body)
    {
        var message = new SendGridMessage
        {
            From = new EmailAddress(_emailSettings.FromEmail, _emailSettings.FromName),
            Subject = subject,
            HtmlContent = body
        };
        message.AddTo(new EmailAddress(to));

        var response = await _sendGridClient!.SendEmailAsync(message);

        if (!response.IsSuccessStatusCode)
        {
            var responseBody = await response.Body.ReadAsStringAsync();
            throw new InvalidOperationException($"Failed to send email: {response.StatusCode} - {responseBody}");
        }
    }

    private async Task SendViaSmtpAsync(string to, string subject, string body)
    {
        var response = await _fluentEmail
            .To(to)
            .Subject(subject)
            .Body(body, isHtml: true)
            .SendAsync();

        if (!response.Successful)
        {
            throw new InvalidOperationException($"Failed to send email: {string.Join(", ", response.ErrorMessages)}");
        }
    }

    #endregion

    #region Email Templates

    /// <summary>
    /// Generates the HTML template for email verification
    /// </summary>
    private string GetVerificationEmailTemplate(string confirmationLink, string userName)
    {
        var displayName = string.IsNullOrWhiteSpace(userName) ? "Reader" : userName;

        return $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Verify Your Email</title>
</head>
<body style=""margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: {BackgroundColor};"">
    <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""width: 100%; background-color: {BackgroundColor};"">
        <tr>
            <td style=""padding: 48px 24px;"">
                <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);"">
                    
                    <!-- Header -->
                    <tr>
                        <td style=""background: {PrimaryColor}; padding: 48px 40px; text-align: center;"">
                            <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""margin: 0 auto;"">
                                <tr>
                                    <td style=""font-size: 40px; line-height: 1;"">📚</td>
                                </tr>
                                <tr>
                                    <td style=""padding-top: 16px;"">
                                        <h1 style=""margin: 0; font-size: 28px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px;"">
                                            BookClub
                                        </h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style=""padding-top: 8px;"">
                                        <p style=""margin: 0; font-size: 14px; color: {TextLightColor};"">
                                            Your Reading Community
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style=""padding: 48px 40px;"">
                            <!-- Greeting -->
                            <h2 style=""margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: {TextDarkColor};"">
                                Welcome, {displayName}! 👋
                            </h2>
                            <p style=""margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: {TextMutedColor};"">
                                Thanks for joining BookClub! Please verify your email address to unlock all features.
                            </p>

                            <!-- Features Box -->
                            <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""width: 100%; background-color: {CardBgColor}; border-radius: 12px; margin-bottom: 32px;"">
                                <tr>
                                    <td style=""padding: 24px;"">
                                        <p style=""margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: {TextDarkColor};"">
                                            After verification, you'll have access to:
                                        </p>
                                        <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""width: 100%;"">
                                            <tr>
                                                <td style=""padding: 8px 0; font-size: 14px; color: {TextMutedColor};"">
                                                    <span style=""color: {AccentColor}; margin-right: 8px;"">✓</span>
                                                    Real-time chat with fellow readers
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style=""padding: 8px 0; font-size: 14px; color: {TextMutedColor};"">
                                                    <span style=""color: {AccentColor}; margin-right: 8px;"">✓</span>
                                                    Write reviews and rate books
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style=""padding: 8px 0; font-size: 14px; color: {TextMutedColor};"">
                                                    <span style=""color: {AccentColor}; margin-right: 8px;"">✓</span>
                                                    Join reading challenges
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style=""padding: 8px 0; font-size: 14px; color: {TextMutedColor};"">
                                                    <span style=""color: {AccentColor}; margin-right: 8px;"">✓</span>
                                                    Create custom bookshelves
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""width: 100%;"">
                                <tr>
                                    <td style=""text-align: center; padding-bottom: 32px;"">
                                        <a href=""{confirmationLink}"" 
                                           style=""display: inline-block; 
                                                  background-color: {PrimaryColor}; 
                                                  color: #FFFFFF; 
                                                  text-decoration: none; 
                                                  padding: 16px 40px; 
                                                  font-size: 16px; 
                                                  font-weight: 600; 
                                                  border-radius: 10px;
                                                  box-shadow: 0 4px 12px rgba(28, 25, 23, 0.3);"">
                                            Verify My Email
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Divider -->
                            <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""width: 100%;"">
                                <tr>
                                    <td style=""border-top: 1px solid {BorderColor}; padding-top: 24px;"">
                                        <p style=""margin: 0 0 8px 0; font-size: 13px; color: {TextLightColor}; text-align: center;"">
                                            Button not working? Copy and paste this link:
                                        </p>
                                        <p style=""margin: 0; font-size: 12px; word-break: break-all; color: {TextMutedColor}; text-align: center; background: {CardBgColor}; padding: 12px; border-radius: 8px;"">
                                            {confirmationLink}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style=""background-color: {CardBgColor}; padding: 24px 40px; text-align: center; border-top: 1px solid {BorderColor};"">
                            <p style=""margin: 0 0 8px 0; font-size: 13px; color: {TextLightColor};"">
                                If you didn't create this account, you can safely ignore this email.
                            </p>
                            <p style=""margin: 0; font-size: 12px; color: {TextLightColor};"">
                                © {DateTime.UtcNow.Year} BookClub. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    /// <summary>
    /// Generates the HTML template for password reset
    /// </summary>
    private string GetPasswordResetEmailTemplate(string resetLink, string userName)
    {
        var displayName = string.IsNullOrWhiteSpace(userName) ? "Reader" : userName;

        return $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Reset Your Password</title>
</head>
<body style=""margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: {BackgroundColor};"">
    <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""width: 100%; background-color: {BackgroundColor};"">
        <tr>
            <td style=""padding: 48px 24px;"">
                <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);"">
                    
                    <!-- Header -->
                    <tr>
                        <td style=""background: {PrimaryColor}; padding: 48px 40px; text-align: center;"">
                            <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""margin: 0 auto;"">
                                <tr>
                                    <td style=""font-size: 40px; line-height: 1;"">🔐</td>
                                </tr>
                                <tr>
                                    <td style=""padding-top: 16px;"">
                                        <h1 style=""margin: 0; font-size: 28px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px;"">
                                            BookClub
                                        </h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style=""padding-top: 8px;"">
                                        <p style=""margin: 0; font-size: 14px; color: {TextLightColor};"">
                                            Password Reset
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style=""padding: 48px 40px;"">
                            <!-- Greeting -->
                            <h2 style=""margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: {TextDarkColor};"">
                                Hi, {displayName} 🔑
                            </h2>
                            <p style=""margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: {TextMutedColor};"">
                                We received a request to reset your password. Click the button below to create a new password.
                            </p>

                            <!-- Warning Box -->
                            <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""width: 100%; background-color: #FEF3C7; border-left: 4px solid {AccentColor}; border-radius: 8px; margin-bottom: 32px;"">
                                <tr>
                                    <td style=""padding: 16px 20px;"">
                                        <p style=""margin: 0; font-size: 14px; color: #92400E; line-height: 1.5;"">
                                            <strong>⏱ Expires in 24 hours</strong><br>
                                            This link is valid for 24 hours. If you didn't request this, please ignore this email.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""width: 100%;"">
                                <tr>
                                    <td style=""text-align: center; padding-bottom: 32px;"">
                                        <a href=""{resetLink}"" 
                                           style=""display: inline-block; 
                                                  background-color: {PrimaryColor}; 
                                                  color: #FFFFFF; 
                                                  text-decoration: none; 
                                                  padding: 16px 40px; 
                                                  font-size: 16px; 
                                                  font-weight: 600; 
                                                  border-radius: 10px;
                                                  box-shadow: 0 4px 12px rgba(28, 25, 23, 0.3);"">
                                            Reset My Password
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Security Notice -->
                            <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""width: 100%; background-color: #FEE2E2; border-left: 4px solid #EF4444; border-radius: 8px; margin-bottom: 24px;"">
                                <tr>
                                    <td style=""padding: 16px 20px;"">
                                        <p style=""margin: 0; font-size: 13px; color: #991B1B; line-height: 1.5;"">
                                            <strong>🛡 Security Tip:</strong> Never share this link with anyone. Our team will never ask for your password.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Divider -->
                            <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" style=""width: 100%;"">
                                <tr>
                                    <td style=""border-top: 1px solid {BorderColor}; padding-top: 24px;"">
                                        <p style=""margin: 0 0 8px 0; font-size: 13px; color: {TextLightColor}; text-align: center;"">
                                            Button not working? Copy and paste this link:
                                        </p>
                                        <p style=""margin: 0; font-size: 12px; word-break: break-all; color: {TextMutedColor}; text-align: center; background: {CardBgColor}; padding: 12px; border-radius: 8px;"">
                                            {resetLink}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style=""background-color: {CardBgColor}; padding: 24px 40px; text-align: center; border-top: 1px solid {BorderColor};"">
                            <p style=""margin: 0 0 8px 0; font-size: 13px; color: {TextLightColor};"">
                                If you didn't request a password reset, you can safely ignore this email.
                            </p>
                            <p style=""margin: 0; font-size: 12px; color: {TextLightColor};"">
                                © {DateTime.UtcNow.Year} BookClub. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    #endregion
}
