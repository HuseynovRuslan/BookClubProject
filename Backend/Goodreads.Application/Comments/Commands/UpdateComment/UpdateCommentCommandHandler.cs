using Goodreads.Application.Common.Interfaces;
using Goodreads.Domain.Errors;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Goodreads.Application.Comments.Commands.UpdateComment;

public class UpdateCommentCommandHandler : IRequestHandler<UpdateCommentCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly ILogger<UpdateCommentCommandHandler> _logger;

    public UpdateCommentCommandHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        ILogger<UpdateCommentCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _logger = logger;
    }

    public async Task<Result> Handle(UpdateCommentCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (string.IsNullOrEmpty(userId))
            return Result.Fail(AuthErrors.Unauthorized);

        var comment = await _unitOfWork.Comments.GetByIdAsync(request.Id);

        if (comment == null)
            return Result.Fail(CommentErrors.NotFound(request.Id));

        if (comment.UserId != userId)
            return Result.Fail(AuthErrors.Forbidden);

        comment.Text = request.Text;

        _unitOfWork.Comments.Update(comment);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Comment {CommentId} updated by user {UserId}", request.Id, userId);

        return Result.Ok();
    }
}
