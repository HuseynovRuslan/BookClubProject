using AutoMapper;
using Goodreads.Application.Common.Interfaces;
using Goodreads.Application.DTOs;
using Goodreads.Domain.Errors;
using MediatR;
using SharedKernel;

namespace Goodreads.Application.Messages.Commands.EditMessage;
public class EditMessageCommandHandler : IRequestHandler<EditMessageCommand, Result<MessageDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly IMapper _mapper;
    private readonly ILogger<EditMessageCommandHandler> _logger;

    public EditMessageCommandHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        IMapper mapper,
        ILogger<EditMessageCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<MessageDto>> Handle(EditMessageCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            return Result<MessageDto>.Fail(AuthErrors.Unauthorized);

        var message = await _unitOfWork.Messages.GetByIdAsync(request.MessageId);
        if (message == null)
            return Result<MessageDto>.Fail(MessageErrors.NotFound(request.MessageId));

        if (message.SenderId != userId)
            return Result<MessageDto>.Fail(MessageErrors.EditNotAuthorized);

        if (message.IsDeleted)
            return Result<MessageDto>.Fail(MessageErrors.NotFound(request.MessageId));

        var newText = request.Text?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(newText))
            return Result<MessageDto>.Fail(Error.Validation("Messages.EmptyText", "Message text cannot be empty."));

        message.Text = newText;
        message.UpdatedAt = DateTime.UtcNow;

        // Update conversation last message text if this was the last message
        var conversation = await _unitOfWork.Conversations.GetSingleOrDefaultAsync(
            filter: c => (c.User1Id == message.SenderId && c.User2Id == message.ReceiverId) ||
                         (c.User1Id == message.ReceiverId && c.User2Id == message.SenderId));

        if (conversation != null && conversation.LastMessageAt == message.CreatedAt)
        {
            conversation.LastMessageText = newText;
        }

        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("User {UserId} edited message {MessageId}", userId, request.MessageId);

        var dto = _mapper.Map<MessageDto>(message);
        return Result<MessageDto>.Ok(dto);
    }
}
