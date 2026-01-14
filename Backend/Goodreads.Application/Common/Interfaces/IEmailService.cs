namespace Goodreads.Application.Common.Interfaces;

public interface IEmailService
{
    /// <summary>
    /// Sends a generic email with custom HTML body
    /// </summary>
    Task SendEmailAsync(string to, string subject, string body);

    /// <summary>
    /// Sends a verification email with a beautiful HTML template
    /// </summary>
    Task SendVerificationEmailAsync(string to, string userName, string confirmationLink);

    /// <summary>
    /// Sends a password reset email with a beautiful HTML template
    /// </summary>
    Task SendPasswordResetEmailAsync(string to, string userName, string resetLink);
}
