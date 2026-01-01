namespace Goodreads.Domain.Entities;

public class Comment : BaseEntity
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Text { get; set; }
    public string UserId { get; set; }
    public User User { get; set; }
    
    // Opsional: Hansi obyektə aid olduğunu bildirmək üçün (Məsələn: BookId və ya InformationId)
    public string? TargetId { get; set; } 

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
