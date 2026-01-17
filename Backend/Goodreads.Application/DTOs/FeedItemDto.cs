namespace Goodreads.Application.DTOs;

public class FeedItemDto
{
    public string Id { get; set; } = null!;
    public string ActivityType { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public UserDto User { get; set; } = null!;
    
   
    public QuoteDto? Quote { get; set; }
    
   
    public BookReviewDto? Review { get; set; }
    
 
    public BookDto? Book { get; set; }
    public string? ShelfName { get; set; }
    public string? BookShelfId { get; set; }
    
    public int LikesCount { get; set; }
    public int CommentsCount { get; set; }
    public bool IsLiked { get; set; }
}


