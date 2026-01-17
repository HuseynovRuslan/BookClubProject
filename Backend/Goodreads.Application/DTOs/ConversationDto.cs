namespace Goodreads.Application.DTOs;
public class ConversationDto
{
    public string Id { get; set; } = null!;
    public DateTime? LastMessageAt { get; set; }
    public string? LastMessageText { get; set; }
    public int UnreadCount { get; set; }
    
    public UserDto? OtherUser { get; set; }
}
