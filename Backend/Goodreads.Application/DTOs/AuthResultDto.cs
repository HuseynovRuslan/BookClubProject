namespace Goodreads.Application.DTOs;
public class AuthResultDto
{
    public string AccessToken { get; set; }
    public string RefreshToken { get; set; }
    public bool EmailConfirmed { get; set; }
}
