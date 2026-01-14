using AutoMapper;
using Goodreads.Application.Common.Interfaces;
using Goodreads.Application.DTOs;
using Goodreads.Application.Notifications.Commands.CreateNotification;
using Goodreads.Domain.Entities;
using Goodreads.Domain.Errors;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
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
    private readonly IMediator _mediator;
    private readonly INotificationService _notificationService2;

    public SendMessageCommandHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        IMapper mapper,
        ILogger<SendMessageCommandHandler> logger,
        UserManager<User> userManager,
        IMessageNotificationService notificationService,
        IMediator mediator,
        INotificationService notificationService2)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _mapper = mapper;
        _logger = logger;
        _userManager = userManager;
        _notificationService = notificationService;
        _mediator = mediator;
        _notificationService2 = notificationService2;
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

        // Check for existing conversation in BOTH directions
        var conversation = await _unitOfWork.Conversations.GetSingleOrDefaultAsync(
            filter: c => (c.User1Id == senderId && c.User2Id == request.ReceiverId) ||
                         (c.User1Id == request.ReceiverId && c.User2Id == senderId));

        if (conversation == null)
        {
            // No conversation exists, create a new one
            // Ensure consistent ordering: smaller GUID always in User1Id (lexicographical order)
            var user1Id = string.Compare(senderId, request.ReceiverId, StringComparison.Ordinal) < 0 
                ? senderId 
                : request.ReceiverId;
            var user2Id = string.Compare(senderId, request.ReceiverId, StringComparison.Ordinal) < 0 
                ? request.ReceiverId 
                : senderId;

            conversation = new Conversation
            {
                User1Id = user1Id,
                User2Id = user2Id,
                IsDeleted = false
            };
            await _unitOfWork.Conversations.AddAsync(conversation);
        }
        else
        {
            // Conversation exists - check if it's deleted and restore it if needed
            if (conversation.IsDeleted)
            {
                conversation.IsDeleted = false;
                conversation.DeletedAt = null;
            }
        }

        // Create message
        var message = new Message
        {
            SenderId = senderId,
            ReceiverId = request.ReceiverId,
            Text = request.Text.Trim()
        };
        await _unitOfWork.Messages.AddAsync(message);

        // Update conversation with latest message info
        conversation.LastMessageAt = DateTime.UtcNow;
        conversation.LastMessageText = request.Text.Trim();
        
        // Update unread count for receiver
        if (conversation.User1Id == request.ReceiverId)
            conversation.UnreadCountUser1++;
        else if (conversation.User2Id == request.ReceiverId)
            conversation.UnreadCountUser2++;

        // Save all changes
        try
        {
            await _unitOfWork.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            // Check if this is a duplicate key error for Conversations table
            // Check both the exception message and inner exception message
            var exceptionMessage = ex.InnerException?.Message ?? ex.Message ?? string.Empty;
            var isDuplicateKeyError = exceptionMessage.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
                                     exceptionMessage.Contains("unique constraint", StringComparison.OrdinalIgnoreCase) ||
                                     exceptionMessage.Contains("IX_Conversations_User1Id_User2Id", StringComparison.OrdinalIgnoreCase) ||
                                     exceptionMessage.Contains("Cannot insert duplicate key", StringComparison.OrdinalIgnoreCase) ||
                                     ex.Message?.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) == true ||
                                     ex.Message?.Contains("IX_Conversations_User1Id_User2Id", StringComparison.OrdinalIgnoreCase) == true;

            if (isDuplicateKeyError)
            {
                // Race condition: conversation was created by another concurrent request
                _logger.LogWarning("Conversation duplicate key detected between {SenderId} and {ReceiverId}, re-fetching. Exception: {ExceptionMessage}", 
                    senderId, request.ReceiverId, ex.InnerException?.Message ?? ex.Message);
                
                // Clear the change tracker to remove the failed entities
                _unitOfWork.ClearChangeTracker();
                
                // Re-fetch the existing conversation (check both directions)
                conversation = await _unitOfWork.Conversations.GetSingleOrDefaultAsync(
                    filter: c => (c.User1Id == senderId && c.User2Id == request.ReceiverId) ||
                                 (c.User1Id == request.ReceiverId && c.User2Id == senderId));
                
                if (conversation == null)
                {
                    // This should not happen, but throw if it does
                    _logger.LogError("Conversation not found after duplicate key error between {SenderId} and {ReceiverId}", senderId, request.ReceiverId);
                    throw;
                }
                
                // Restore conversation if it was deleted
                if (conversation.IsDeleted)
                {
                    conversation.IsDeleted = false;
                    conversation.DeletedAt = null;
                }
                
                // Recreate the message entity since it was cleared from tracker
                message = new Message
                {
                    SenderId = senderId,
                    ReceiverId = request.ReceiverId,
                    Text = request.Text.Trim()
                };
                await _unitOfWork.Messages.AddAsync(message);
                
                // Update conversation with the new message info
                conversation.LastMessageAt = DateTime.UtcNow;
                conversation.LastMessageText = request.Text.Trim();
                
                // Update unread count for receiver
                if (conversation.User1Id == request.ReceiverId)
                    conversation.UnreadCountUser1++;
                else if (conversation.User2Id == request.ReceiverId)
                    conversation.UnreadCountUser2++;
                
                // Save again
                await _unitOfWork.SaveChangesAsync();
            }
            else
            {
                // Not a duplicate key error, re-throw
                _logger.LogError("Unexpected DbUpdateException: {ExceptionMessage}", ex.InnerException?.Message ?? ex.Message);
                throw;
            }
        }

        // Get sender for DTO and notification
        var sender = await _userManager.FindByIdAsync(senderId);
        if (sender == null)
            return Result<MessageDto>.Fail(UserErrors.NotFound(senderId));

        // Map to DTO with sender and receiver
        var messageDto = _mapper.Map<MessageDto>(message);
        messageDto.Sender = _mapper.Map<UserDto>(sender);
        messageDto.Receiver = _mapper.Map<UserDto>(receiver);

        _logger.LogInformation("User {SenderId} sent message to {ReceiverId}", senderId, request.ReceiverId);

        // Create database notification for receiver

        var senderName = $"{sender.FirstName} {sender.LastName}".Trim();
        if (string.IsNullOrWhiteSpace(senderName))
            senderName = sender.UserName ?? "Someone";

        var createNotificationResult = await _mediator.Send(new CreateNotificationCommand(
            UserId: request.ReceiverId,
            ActorId: senderId,
            Type: NotificationType.MessageReceived,
            Title: $"New message from {senderName}",
            Message: request.Text.Trim().Length > 100 ? request.Text.Trim().Substring(0, 100) + "..." : request.Text.Trim(),
            RelatedEntityId: message.Id,
            RelatedEntityType: "Message"
        ));

        // Send real-time notification to receiver via SignalR (for messages)
        await _notificationService.SendMessageToUserAsync(request.ReceiverId, messageDto);
        
        // Also send to conversation group for both users
        var groupName = string.Compare(senderId, request.ReceiverId, StringComparison.Ordinal) < 0
            ? $"conversation_{senderId}_{request.ReceiverId}"
            : $"conversation_{request.ReceiverId}_{senderId}";
        await _notificationService.SendMessageToGroupAsync(groupName, messageDto);

        // Send notification via notifications hub (for notification system)
        if (createNotificationResult.IsSuccess && !string.IsNullOrEmpty(createNotificationResult.Data))
        {
            var notification = await _unitOfWork.Notifications.GetByIdAsync(createNotificationResult.Data);
            if (notification != null)
            {
                var notificationDto = _mapper.Map<NotificationDto>(notification);
                notificationDto.Actor = _mapper.Map<UserDto>(sender);
                await _notificationService2.SendNotificationToUserAsync(request.ReceiverId, notificationDto);
            }
        }

        return Result<MessageDto>.Ok(messageDto);
    }
}
