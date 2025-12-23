namespace Goodreads.Infrastructure.Services.EmailService;
public class EmailSettings
{
    public const string Section = "EmailSettings";
    public bool UseSmtp4Dev { get; set; }
    public bool UseSendGrid { get; set; } = true;
    public string FromEmail { get; set; } = default!;
    public string FromName { get; set; } = default!;
    public string SendGridApiKey { get; set; } = default!;
    public string Host { get; set; } = default!;
    public int Port { get; set; }
    public string Username { get; set; } = default!;
    public string Password { get; set; } = default!;
}
