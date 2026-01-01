namespace Goodreads.Domain.Entities;

public class FeedBack : BaseEntity
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; }
    public User User { get; set; }
    
    public string Subject { get; set; } = default!;
    public string Message { get; set; } = default!;

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
