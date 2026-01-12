using AutoMapper;
using Goodreads.Application.Common.Interfaces;
using Goodreads.Application.DTOs;
using Goodreads.Domain.Entities;
using Goodreads.Domain.Errors;
using MediatR;
using Microsoft.AspNetCore.Identity;
using SharedKernel;

namespace Goodreads.Application.Messages.Commands.SendMessage;
public class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, Result<MessageDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly IMapper _mapper;
    private readonly ILogger<SendMessageCommandHandler> _logger;
    private readonly UserManager<User> _userManager;
    private readonly IMessageNotificationService _notificationService;

    public SendMessageCommandHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        IMapper mapper,
        ILogger<SendMessageCommandHandler> logger,
        UserManager<User> userManager,
        IMessageNotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _mapper = mapper;
        _logger = logger;
        _userManager = userManager;
        _notificationService = notificationService;
    }

    public async Task<Result<MessageDto>> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        var senderId = _userContext.UserId;
        if (senderId == null)
            return Result<MessageDto>.Fail(AuthErrors.Unauthorized);

        // Check if receiver exists
        var receiver = await _userManager.FindByIdAsync(request.ReceiverId);
        if (receiver == null)
            return Result<MessageDto>.Fail(UserErrors.NotFound(request.ReceiverId));

        // Check if user is trying to message themselves
        if (senderId == request.ReceiverId)
            return Result<MessageDto>.Fail(MessageErrors.SelfMessage);

        // Get or create conversation
        // Ensure consistent ordering: smaller ID always in User1Id
        var user1Id = string.Compare(senderId, request.ReceiverId, StringComparison.Ordinal) < 0 ? senderId : request.ReceiverId;
        var user2Id = string.Compare(senderId, request.ReceiverId, StringComparison.Ordinal) < 0 ? request.ReceiverId : senderId;

        var conversation = await _unitOfWork.Conversations.GetSingleOrDefaultAsync(
            filter: c => c.User1Id == user1Id && c.User2Id == user2Id);

        if (conversation == null)
        {
            // Create new conversation with consistent ordering
            conversation = new Conversation
            {
                User1Id = user1Id,
                User2Id = user2Id
            };
            await _unitOfWork.Conversations.AddAsync(conversation);
        }

        // Create message
        var message = new Message
        {
            SenderId = senderId,
            ReceiverId = request.ReceiverId,
            Text = request.Text.Trim()
        };
        await _unitOfWork.Messages.AddAsync(message);

        // Update conversation
        conversation.LastMessageAt = DateTime.UtcNow;
        conversation.LastMessageText = request.Text.Trim();
        
        // Update unread count for receiver
        // Note: conversation.User1Id and User2Id are now consistently ordered
        if (conversation.User1Id == request.ReceiverId)
            conversation.UnreadCountUser1++;
        else if (conversation.User2Id == request.ReceiverId)
            conversation.UnreadCountUser2++;

        await _unitOfWork.SaveChangesAsync();

        // Map to DTO with sender and receiver
        var messageDto = _mapper.Map<MessageDto>(message);
        var sender = await _userManager.FindByIdAsync(senderId);
        if (sender != null)
        {
            messageDto.Sender = _mapper.Map<UserDto>(sender);
        }
        messageDto.Receiver = _mapper.Map<UserDto>(receiver);

        _logger.LogInformation("User {SenderId} sent message to {ReceiverId}", senderId, request.ReceiverId);

        // Send real-time notification to receiver via SignalR
        await _notificationService.SendMessageToUserAsync(request.ReceiverId, messageDto);
        
        // Also send to conversation group for both users
        var groupName = string.Compare(senderId, request.ReceiverId, StringComparison.Ordinal) < 0
            ? $"conversation_{senderId}_{request.ReceiverId}"
            : $"conversation_{request.ReceiverId}_{senderId}";
        await _notificationService.SendMessageToGroupAsync(groupName, messageDto);

        return Result<MessageDto>.Ok(messageDto);
    }
}
