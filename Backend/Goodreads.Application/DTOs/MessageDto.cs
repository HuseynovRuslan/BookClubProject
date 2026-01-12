namespace Goodreads.Application.DTOs;
public class MessageDto
{
    public string Id { get; set; } = null!;
    public string SenderId { get; set; } = null!;
    public string ReceiverId { get; set; } = null!;
    public string Text { get; set; } = null!;
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Navigation properties
    public UserDto? Sender { get; set; }
    public UserDto? Receiver { get; set; }
}
