namespace Goodreads.Application.DTOs;
public class ShelfDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public int BookCount { get; set; }
    public List<BookDto> Books { get; set; } = new();
}
