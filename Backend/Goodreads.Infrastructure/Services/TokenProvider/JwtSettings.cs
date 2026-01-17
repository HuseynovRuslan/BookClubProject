namespace Goodreads.Infrastructure.Services.TokenProvider;
internal class JwtSettings
{
    public const string Section = "JwtSettings";
    public string Secret { get; set; } = default!;
    public int TokenExpirationInMinutes { get; set; } = 43200; // 30 days
    public string Issuer { get; set; } = default!;
    public string Audience { get; set; } = default!;

}
