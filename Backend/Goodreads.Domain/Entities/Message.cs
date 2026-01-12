namespace Goodreads.Domain.Entities;
public class Message : BaseEntity
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    public string SenderId { get; set; } = null!;
    public User Sender { get; set; } = null!;
    
    public string ReceiverId { get; set; } = null!;
    public User Receiver { get; set; } = null!;
    
    public string Text { get; set; } = null!;
    
    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }
    
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
