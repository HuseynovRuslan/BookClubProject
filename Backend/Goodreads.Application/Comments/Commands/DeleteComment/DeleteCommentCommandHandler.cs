namespace Goodreads.Application.Comments.Commands.DeleteComment;

public class DeleteCommentCommandHandler : IRequestHandler<DeleteCommentCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DeleteCommentCommandHandler> _logger;

    public DeleteCommentCommandHandler(IUnitOfWork unitOfWork, ILogger<DeleteCommentCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteCommentCommand request, CancellationToken cancellationToken)
    {
        var comment = await _unitOfWork.Comments.GetByIdAsync(request.Id);

        if (comment == null)
        {
            _logger.LogWarning("Comment with ID: {CommentId} not found", request.Id);
            return Result.Fail(CommentErrors.NotFound(request.Id));
        }

        comment.IsDeleted = true;
        comment.DeletedAt = DateTime.UtcNow;

        _unitOfWork.Comments.Update(comment);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Comment with ID: {CommentId} deleted successfully", request.Id);
        return Result.Ok();
    }
}
