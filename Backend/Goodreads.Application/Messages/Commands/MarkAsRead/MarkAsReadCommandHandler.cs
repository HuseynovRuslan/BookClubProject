using Goodreads.Application.Common.Interfaces;
using Goodreads.Domain.Errors;
using MediatR;
using SharedKernel;

namespace Goodreads.Application.Messages.Commands.MarkAsRead;
public class MarkAsReadCommandHandler : IRequestHandler<MarkAsReadCommand, Result<bool>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly IMessageNotificationService _notificationService;
    private readonly ILogger<MarkAsReadCommandHandler> _logger;

    public MarkAsReadCommandHandler(
        IUnitOfWork unitOfWork, 
        IUserContext userContext,
        IMessageNotificationService notificationService,
        ILogger<MarkAsReadCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(MarkAsReadCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            return Result<bool>.Fail(AuthErrors.Unauthorized);

        var message = await _unitOfWork.Messages.GetByIdAsync(request.MessageId);
        if (message == null)
            return Result<bool>.Fail(MessageErrors.NotFound(request.MessageId));

        // Only receiver can mark as read
        if (message.ReceiverId != userId)
            return Result<bool>.Fail(MessageErrors.NotAuthorized);

        if (!message.IsRead)
        {
            message.IsRead = true;
            message.ReadAt = DateTime.UtcNow;

            // Update conversation unread count
            var conversation = await _unitOfWork.Conversations.GetSingleOrDefaultAsync(
                filter: c => (c.User1Id == message.SenderId && c.User2Id == userId) ||
                             (c.User1Id == userId && c.User2Id == message.SenderId));

            if (conversation != null)
            {
                if (conversation.User1Id == userId)
                    conversation.UnreadCountUser1 = Math.Max(0, conversation.UnreadCountUser1 - 1);
                else
                    conversation.UnreadCountUser2 = Math.Max(0, conversation.UnreadCountUser2 - 1);
            }

            await _unitOfWork.SaveChangesAsync();

            // Notify sender that message was read
            if (message.ReadAt.HasValue)
            {
                await _notificationService.NotifyMessageReadAsync(message.SenderId, message.Id, message.ReadAt.Value);
            }
        }

        return Result<bool>.Ok(true);
    }
}
