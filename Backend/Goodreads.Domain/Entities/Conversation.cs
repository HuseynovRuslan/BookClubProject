namespace Goodreads.Domain.Entities;
public class Conversation : BaseEntity
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    public string User1Id { get; set; } = null!;
    public User User1 { get; set; } = null!;
    
    public string User2Id { get; set; } = null!;
    public User User2 { get; set; } = null!;
    
    public DateTime? LastMessageAt { get; set; }
    public string? LastMessageText { get; set; }
    
    public int UnreadCountUser1 { get; set; } = 0;
    public int UnreadCountUser2 { get; set; } = 0;
    
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
