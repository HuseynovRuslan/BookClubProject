namespace Goodreads.Domain.Entities;

/// <summary>
/// Generic Like entity that supports liking different entity types (Quote, Review, BookShelf)
/// </summary>
public class Like
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    /// <summary>
    /// The ID of the entity being liked (QuoteId, ReviewId, or BookShelfId)
    /// </summary>
    public string TargetId { get; set; } = null!;
    
    /// <summary>
    /// The type of entity being liked: "Quote", "Review", "BookShelf"
    /// </summary>
    public string TargetType { get; set; } = null!;
    
    public string UserId { get; set; } = null!;
    public User User { get; set; } = null!;

    public DateTime LikedAt { get; set; } = DateTime.UtcNow;

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
