using Goodreads.Domain.Entities;

namespace Goodreads.Domain.Entities;

public class SavedPost
{
    // Quote ID və ya Review ID
    public string PostId { get; set; } = null!;

    // "Quote" və ya "Review"
    public string PostType { get; set; } = null!;

    public string UserId { get; set; } = null!;
    public User User { get; set; } = null!;

    public DateTime SavedAt { get; set; } = DateTime.UtcNow;

    // Soft delete üçün
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
