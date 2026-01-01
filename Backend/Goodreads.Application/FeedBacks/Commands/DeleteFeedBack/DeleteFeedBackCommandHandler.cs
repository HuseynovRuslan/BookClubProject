namespace Goodreads.Application.FeedBacks.Commands.DeleteFeedBack;

internal class DeleteFeedBackCommandHandler : IRequestHandler<DeleteFeedBackCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteFeedBackCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteFeedBackCommand request, CancellationToken cancellationToken)
    {
        var feedback = await _unitOfWork.FeedBacks.GetByIdAsync(request.Id);

        if (feedback == null)
        {
            return Result.Fail(FeedBackErrors.NotFound(request.Id));
        }

        feedback.IsDeleted = true;
        feedback.DeletedAt = DateTime.UtcNow;

        _unitOfWork.FeedBacks.Update(feedback);
        await _unitOfWork.SaveChangesAsync();

        return Result.Ok();
    }
}
