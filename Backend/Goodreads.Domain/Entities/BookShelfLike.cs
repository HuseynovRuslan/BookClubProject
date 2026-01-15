namespace Goodreads.Domain.Entities;

public class BookShelfLike
{
    public string BookId { get; set; } = null!;
    public Book Book { get; set; } = null!;
    
    public string ShelfId { get; set; } = null!;
    public Shelf Shelf { get; set; } = null!;
    
    public string UserId { get; set; } = null!;
    public User User { get; set; } = null!;
    
    public DateTime LikedAt { get; set; } = DateTime.UtcNow;
    
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
