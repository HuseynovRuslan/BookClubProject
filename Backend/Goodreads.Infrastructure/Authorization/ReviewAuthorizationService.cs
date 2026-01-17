using Goodreads.Application.Common.Interfaces;
using Goodreads.Application.Common.Interfaces.Authorization;
using Goodreads.Domain.Constants;

namespace Goodreads.Infrastructure.Authorization;
internal class ReviewAuthorizationService(IUnitOfWork unitOfWork, IUserContext userContext) : IReviewAuthorizationService
{
    public async Task<bool> Authorize(string reviewId)
    {
        var userId = userContext.UserId;
        if (string.IsNullOrEmpty(userId))
            return false;

        if (userContext.IsInRole(Roles.Admin))
            return true;

        var review = await unitOfWork.BookReviews.GetByIdAsync(reviewId);

        if (review == null)
            return false;

        return review.UserId == userId;
    }
}

