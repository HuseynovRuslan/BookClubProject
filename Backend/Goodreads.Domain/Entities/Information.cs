namespace Goodreads.Domain.Entities;

public class Information : BaseEntity
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Title { get; set; }
    public string Content { get; set; }
    public string Details { get; set; }
    public string? CoverImageUrl { get; set; }
    public bool IsRead { get; set; } = false;

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}  
