namespace Goodreads.Application.DTOs;

public class NotificationDto
{
    public string Id { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public string ActorId { get; set; } = null!;
    public UserDto? Actor { get; set; }
    public NotificationTypeDto Type { get; set; }
    public string? RelatedEntityId { get; set; }
    public string? RelatedEntityType { get; set; }
    public string Title { get; set; } = null!;
    public string? Message { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public enum NotificationTypeDto
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
