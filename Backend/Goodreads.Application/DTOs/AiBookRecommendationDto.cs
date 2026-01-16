namespace Goodreads.Application.DTOs;

public class AiBookRecommendationDto
{
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    
    // Hybrid recommendation properties
    public string? BookId { get; set; }
    public bool ExistsInDb { get; set; }
    public string? CoverImage { get; set; }
}
