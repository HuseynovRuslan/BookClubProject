using Microsoft.AspNetCore.Http;

namespace Goodreads.Application.Authors.Commands.UpdateAuthor;
public class UpdateAuthorCommand : IRequest<Result>
{
    public string AuthorId { get; set; }
    public string? Name { get; set; }
    public string? Bio { get; set; }
    public IFormFile? ProfilePicture { get; set; }
}

