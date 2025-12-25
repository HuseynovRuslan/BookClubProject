namespace Goodreads.Domain.Entities;
public class UserFollow
{
    public string FollowerId { get; set; } = default!;
    public User Follower { get; set; } = default!;

    public string FollowingId { get; set; } = default!;
    public User Following { get; set; } = default!;

    public DateTime FollowedAt { get; set; } = DateTime.UtcNow;

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}

