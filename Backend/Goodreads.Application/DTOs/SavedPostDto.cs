namespace Goodreads.Application.DTOs;

public class SavedPostDto
{
    public string PostId { get; set; } = null!;
    public string PostType { get; set; } = null!;
    public DateTime SavedAt { get; set; }

    // Navigation DTO-lar
    public QuoteDto? Quote { get; set; }
    public BookReviewDto? Review { get; set; }
}
