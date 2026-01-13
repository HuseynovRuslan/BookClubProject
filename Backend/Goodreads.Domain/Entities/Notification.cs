namespace Goodreads.Domain.Entities;

public class Notification : BaseEntity
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = null!;
    public User User { get; set; } = null!;
    public string ActorId { get; set; } = null!;
    public User Actor { get; set; } = null!;
    public NotificationType Type { get; set; }
    public string? RelatedEntityId { get; set; }
    public string? RelatedEntityType { get; set; }
    public string Title { get; set; } = null!;
    public string? Message { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
}

public enum NotificationType
{
    QuoteLike = 1,
    QuoteComment = 2,
    UserFollow = 3,
    MessageReceived = 4,
    ReviewLike = 5,
    ReviewComment = 6,
    BookAddedToShelf = 7,
    ReviewCreated = 8
}
