namespace Goodreads.Application.DTOs;
public class BookDto
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }
    public string? ISBN { get; set; }
    public string? CoverImageUrl { get; set; }
    public DateOnly? PublicationDate { get; set; }
    public string Language { get; set; }
    public int PageCount { get; set; }
    public string Publisher { get; set; }
    public double AverageRating { get; set; } = 0.0;
    public int RatingCount { get; set; } = 0;
    public string AuthorName { get; set; }
    public List<BookGenreDto> Genres { get; set; }
}
