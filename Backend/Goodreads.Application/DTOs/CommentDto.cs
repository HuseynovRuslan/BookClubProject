namespace Goodreads.Application.DTOs;

public class CommentDto
{
    public string Id { get; set; }
    public string Text { get; set; }
    public string UserId { get; set; }
    public string UserName { get; set; }
    public string? UserProfilePicture { get; set; }
    public string? TargetId { get; set; }
    public DateTime CreatedAt { get; set; }
}
