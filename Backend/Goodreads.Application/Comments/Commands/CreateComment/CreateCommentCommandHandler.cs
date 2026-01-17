using Goodreads.Application.Common.Interfaces;
using Goodreads.Application.DTOs;
using Goodreads.Application.Notifications.Commands.CreateNotification;
using Goodreads.Domain.Entities;
using Goodreads.Domain.Errors;
using MediatR;
using Microsoft.AspNetCore.Identity;
using SharedKernel;

namespace Goodreads.Application.Comments.Commands.CreateComment;

public class CreateCommentCommandHandler : IRequestHandler<CreateCommentCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly IMediator _mediator;
    private readonly INotificationService _notificationService;
    private readonly AutoMapper.IMapper _mapper;
    private readonly UserManager<User> _userManager;

    public CreateCommentCommandHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        IMediator mediator,
        INotificationService notificationService,
        AutoMapper.IMapper mapper,
        UserManager<User> userManager)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _mediator = mediator;
        _notificationService = notificationService;
        _mapper = mapper;
        _userManager = userManager;
    }

    public async Task<Result<string>> Handle(CreateCommentCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (string.IsNullOrEmpty(userId))
            return Result<string>.Fail(AuthErrors.Unauthorized);

        var comment = new Comment
        {
            Text = request.Text,
            TargetId = request.TargetId,
            UserId = userId
        };

        await _unitOfWork.Comments.AddAsync(comment);
        await _unitOfWork.SaveChangesAsync();

        if (!string.IsNullOrEmpty(request.TargetId))
        {
            string? targetOwnerId = null;
            string notificationTitle = "";
            NotificationType notificationType = NotificationType.QuoteComment;

            var commenter = await _userManager.FindByIdAsync(userId);
            var commenterName = commenter != null 
                ? ($"{commenter.FirstName} {commenter.LastName}".Trim() != "" 
                    ? $"{commenter.FirstName} {commenter.LastName}".Trim() 
                    : commenter.UserName ?? "Someone")
                : "Someone";

            if (request.TargetType?.ToLower() == "quote" || string.IsNullOrEmpty(request.TargetType))
            {
                var quote = await _unitOfWork.Quotes.GetByIdAsync(request.TargetId);
                if (quote != null)
                {
                    targetOwnerId = quote.CreatedByUserId;
                    notificationTitle = $"{commenterName} commented on your quote";
                    notificationType = NotificationType.QuoteComment;
                }
            }

            if (targetOwnerId == null && (request.TargetType?.ToLower() == "review" || string.IsNullOrEmpty(request.TargetType)))
            {
                var review = await _unitOfWork.BookReviews.GetByIdAsync(request.TargetId);
                if (review != null)
                {
                    targetOwnerId = review.UserId;
                    notificationTitle = $"{commenterName} commented on your review";
                    notificationType = NotificationType.ReviewComment;
                }
            }

            if (targetOwnerId != null && targetOwnerId != userId)
            {
                var createNotificationResult = await _mediator.Send(new CreateNotificationCommand(
                    UserId: targetOwnerId,
                    ActorId: userId,
                    Type: notificationType,
                    Title: notificationTitle,
                    RelatedEntityId: request.TargetId,
                    RelatedEntityType: request.TargetType ?? "Quote"
                ));

                if (createNotificationResult.IsSuccess && !string.IsNullOrEmpty(createNotificationResult.Data))
                {
                    var notification = await _unitOfWork.Notifications.GetByIdAsync(createNotificationResult.Data);
                    if (notification != null && commenter != null)
                    {
                        var notificationDto = _mapper.Map<NotificationDto>(notification);
                        notificationDto.Actor = _mapper.Map<UserDto>(commenter);
                        await _notificationService.SendNotificationToUserAsync(targetOwnerId, notificationDto);
                    }
                }
            }
        }

        return Result<string>.Ok(comment.Id);
    }
}
