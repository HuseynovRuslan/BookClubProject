using Microsoft.AspNetCore.Http;

namespace Goodreads.Application.Authors.Commands.CreateAuthor;
public class CreateAuthorCommand : IRequest<Result<string>>
{
    public string Name { get; set; }
    public string Bio { get; set; }
    public IFormFile? ProfilePicture { get; set; }
};

