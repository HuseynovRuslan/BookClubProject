using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Goodreads.Application.Users.Commands.UpdateProfilePicture;
public class UpdateProfilePictureCommand : IRequest<Result>
{
    [Required]
    public IFormFile File { get; set; } = default!;
}

