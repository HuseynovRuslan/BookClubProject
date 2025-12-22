using FluentEmail.Core;
using FluentEmail.Smtp;
using System.Net.Mail;
using Goodreads.Application.Common.Interfaces;

namespace Goodreads.Infrastructure.Services.EmailService;

public class EmailService : IEmailService
{
    private readonly IFluentEmail _fluentEmail;

    public EmailService()
    {
        var sender = new SmtpSender(() =>
            new SmtpClient("smtp.gmail.com")
            {
                EnableSsl = true,
                Port = 587,
                Credentials = new System.Net.NetworkCredential(
                    "testmaildemo12@gmail.com",    // Gmail
                    "engd rimm nbej ufnz")    // App Password
            });

        // Fix: Set the default sender for FluentEmail instead of using a non-existent 'UsingSender' method
        Email.DefaultSender = sender;

        _fluentEmail = Email
            .From("testmaildemo12@gmail.com", "BookClub");
    }

    public async Task SendEmailAsync(string email, string subject, string body)
    {
        await _fluentEmail
            .To(email)
            .Subject(subject)
            .Body(body, isHtml: true)
            .SendAsync();
    }
}
