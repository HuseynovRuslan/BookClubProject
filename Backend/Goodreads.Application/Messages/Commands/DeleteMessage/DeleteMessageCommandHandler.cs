using Goodreads.Application.Common.Interfaces;
using Goodreads.Domain.Errors;
using MediatR;
using SharedKernel;

namespace Goodreads.Application.Messages.Commands.DeleteMessage;
public class DeleteMessageCommandHandler : IRequestHandler<DeleteMessageCommand, Result<bool>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly ILogger<DeleteMessageCommandHandler> _logger;

    public DeleteMessageCommandHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        ILogger<DeleteMessageCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(DeleteMessageCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            return Result<bool>.Fail(AuthErrors.Unauthorized);

        var message = await _unitOfWork.Messages.GetByIdAsync(request.MessageId);
        if (message == null)
            return Result<bool>.Fail(MessageErrors.NotFound(request.MessageId));

        // Only sender or receiver can delete
        if (message.SenderId != userId && message.ReceiverId != userId)
            return Result<bool>.Fail(Error.Forbidden("Messages.DeleteNotAuthorized", "You can only delete your own messages."));

        // Soft delete
        message.IsDeleted = true;
        message.DeletedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("User {UserId} deleted message {MessageId}", userId, request.MessageId);

        return Result<bool>.Ok(true);
    }
}
