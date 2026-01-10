namespace Goodreads.Application.DTOs;

public class FeedBackDto
{
    public string Id { get; set; }
    public string UserId { get; set; }
    public string? Username { get; set; }
    public string Subject { get; set; }
    public string Message { get; set; }
    public DateTime CreatedAt { get; set; }
}
