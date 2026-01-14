using Goodreads.Application.Common.Interfaces;
using Goodreads.Domain.Errors;
using MediatR;
using SharedKernel;

namespace Goodreads.Application.Messages.Commands.DeleteConversation;
public class DeleteConversationCommandHandler : IRequestHandler<DeleteConversationCommand, Result<bool>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly ILogger<DeleteConversationCommandHandler> _logger;

    public DeleteConversationCommandHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        ILogger<DeleteConversationCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(DeleteConversationCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            return Result<bool>.Fail(AuthErrors.Unauthorized);

        var conversation = await _unitOfWork.Conversations.GetByIdAsync(request.ConversationId);
        if (conversation == null)
            return Result<bool>.Fail(ConversationErrors.NotFound(request.ConversationId));

        // Only participants can delete
        if (conversation.User1Id != userId && conversation.User2Id != userId)
            return Result<bool>.Fail(ConversationErrors.NotAuthorized);

        conversation.IsDeleted = true;
        conversation.DeletedAt = DateTime.UtcNow;

        // Soft delete messages between users
        var (messages, _) = await _unitOfWork.Messages.GetAllAsync(
            filter: m => (m.SenderId == conversation.User1Id && m.ReceiverId == conversation.User2Id) ||
                         (m.SenderId == conversation.User2Id && m.ReceiverId == conversation.User1Id),
            pageNumber: 1,
            pageSize: int.MaxValue);

        foreach (var message in messages)
        {
            message.IsDeleted = true;
            message.DeletedAt = DateTime.UtcNow;
        }

        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("User {UserId} deleted conversation {ConversationId}", userId, request.ConversationId);

        return Result<bool>.Ok(true);
    }
}
