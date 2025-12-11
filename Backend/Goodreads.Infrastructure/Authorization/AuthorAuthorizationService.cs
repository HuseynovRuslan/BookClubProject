using Goodreads.Application.Common.Interfaces;
using Goodreads.Application.Common.Interfaces.Authorization;
using Goodreads.Domain.Constants;

namespace Goodreads.Infrastructure.Authorization;
internal class AuthorAuthorizationService(
    IUnitOfWork unitOfWork,
    IUserContext userContext) : IAuthorAuthorizationService
{
    public async Task<bool> IsAuthorOwnerOrAdminAsync(string authorId)
    {
        var userId = userContext.UserId;
        if (string.IsNullOrEmpty(userId))
            return false;

        // Check if user is admin
        if (userContext.IsInRole(Roles.Admin))
            return true;

        // Check if user claimed this author profile
        var author = await unitOfWork.Authors.GetByIdAsync(authorId);
        if (author == null)
            return false;

        // For now, we'll check if author has UserId (claimed author)
        // In future, you might want to add IsClaimed property
        return author.UserId == userId;
    }
}

