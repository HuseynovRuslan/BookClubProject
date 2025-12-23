using FluentEmail.Core;
using FluentEmail.Core.Models;
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

    public EmailService(IFluentEmail fluentEmail, IOptions<EmailSettings> emailSettings)
    {
        _fluentEmail = fluentEmail;
        _emailSettings = emailSettings.Value;
        
        // SendGrid istifadə olunursa, SendGridClient yarad
        if (_emailSettings.UseSendGrid && !string.IsNullOrWhiteSpace(_emailSettings.SendGridApiKey))
        {
            _sendGridClient = new SendGridClient(_emailSettings.SendGridApiKey);
        }
    }

    public async Task SendEmailAsync(string email, string subject, string body)
    {
        // SendGrid istifadə olunursa, birbaşa SendGrid API-sindən istifadə et
        if (_sendGridClient != null)
        {
            var msg = new SendGridMessage
            {
                From = new EmailAddress(_emailSettings.FromEmail, _emailSettings.FromName),
                Subject = subject,
                HtmlContent = body
            };
            msg.AddTo(new EmailAddress(email));

            var response = await _sendGridClient.SendEmailAsync(msg);
            
            if (!response.IsSuccessStatusCode)
            {
                var responseBody = await response.Body.ReadAsStringAsync();
                throw new InvalidOperationException($"Email göndərilmədi: {response.StatusCode} - {responseBody}");
            }
        }
        else
        {
            // FluentEmail istifadə et (SMTP üçün)
            var response = await _fluentEmail
                .To(email)
                .Subject(subject)
                .Body(body, isHtml: true)
                .SendAsync();

            if (!response.Successful)
            {
                throw new InvalidOperationException($"Email göndərilmədi: {string.Join(", ", response.ErrorMessages)}");
            }
        }
    }
}
