using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Goodreads.Application.Posts.Commands.UploadPostImage;

public class UploadPostImageCommand : IRequest<Result<string>>
{
    [Required]
    public IFormFile File { get; set; } = default!;
}

