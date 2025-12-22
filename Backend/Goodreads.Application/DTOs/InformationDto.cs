namespace Goodreads.Application.DTOs;

public class InformationDto
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public string Details { get; set; }
    public string? CoverImageUrl { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; }
}
