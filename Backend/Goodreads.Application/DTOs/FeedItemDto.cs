namespace Goodreads.Application.DTOs;

public class FeedItemDto
{
    public string Id { get; set; } = null!;
    public string ActivityType { get; set; } = null!; // "Quote", "Review", "BookAdded"
    public DateTime CreatedAt { get; set; }
    public UserDto User { get; set; } = null!;
    
    // Quote activity
    public QuoteDto? Quote { get; set; }
    
    // Review activity
    public BookReviewDto? Review { get; set; }
    
    // Book added activity
    public BookDto? Book { get; set; }
    public string? ShelfName { get; set; }
}


