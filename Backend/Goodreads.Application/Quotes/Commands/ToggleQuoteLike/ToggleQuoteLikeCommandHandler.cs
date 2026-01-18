using Goodreads.Application.Notifications.Commands.CreateNotification;
using Goodreads.Application.Common.Interfaces;
using Goodreads.Domain.Entities;
using MediatR;

namespace Goodreads.Application.Quotes.Commands.ToggleQuoteLike;
public class ToggleQuoteLikeCommandHandler : IRequestHandler<ToggleQuoteLikeCommand, Result<bool>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly ILogger<ToggleQuoteLikeCommandHandler> _logger;
    private readonly IMediator _mediator;
    private readonly INotificationService _notificationService;
    private readonly AutoMapper.IMapper _mapper;

    public ToggleQuoteLikeCommandHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        ILogger<ToggleQuoteLikeCommandHandler> logger,
        IMediator mediator,
        INotificationService notificationService,
        AutoMapper.IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _logger = logger;
        _mediator = mediator;
        _notificationService = notificationService;
        _mapper = mapper;
    }

    public async Task<Result<bool>> Handle(ToggleQuoteLikeCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            return Result<bool>.Fail(AuthErrors.Unauthorized);

        var quote = await _unitOfWork.Quotes.GetByIdAsync(request.QuoteId);
        if (quote == null)
            return Result<bool>.Fail(QuoteErrors.NotFound(request.QuoteId));

        var existingLike = await _unitOfWork.QuoteLikes
            .GetSingleOrDefaultAsync(filter: q => q.QuoteId == request.QuoteId && q.UserId == userId);


        if (existingLike != null)
        {
            // Unlike
            _unitOfWork.QuoteLikes.Delete(existingLike);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("User {UserId} unliked quote {QuoteId}", userId, request.QuoteId);
            return Result<bool>.Ok(false);
        }
        else
        {
            // Like
            var newLike = new QuoteLike { QuoteId = request.QuoteId, UserId = userId };
            await _unitOfWork.QuoteLikes.AddAsync(newLike);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("User {UserId} liked quote {QuoteId}", userId, request.QuoteId);

            // Create notification for quote owner (if not self-like)
            if (quote.CreatedByUserId != userId)
            {
                var actor = await _unitOfWork.Users.GetByIdAsync(userId);
                var actorName = actor != null ? $"{actor.FirstName} {actor.LastName}".Trim() : "Someone";
                if (string.IsNullOrWhiteSpace(actorName))
                    actorName = actor?.UserName ?? "Someone";

                var createNotificationResult = await _mediator.Send(new CreateNotificationCommand(
                    UserId: quote.CreatedByUserId,
                    ActorId: userId,
                    Type: NotificationType.QuoteLike,
                    Title: $"{actorName} liked your quote",
                    RelatedEntityId: request.QuoteId,
                    RelatedEntityType: "Quote"
                ));

               
                if (createNotificationResult.IsSuccess && !string.IsNullOrEmpty(createNotificationResult.Data))
                {
                    var notification = await _unitOfWork.Notifications.GetByIdAsync(createNotificationResult.Data);
                    if (notification != null)
                    {
                        var notificationDto = _mapper.Map<DTOs.NotificationDto>(notification);
                        if (actor != null)
                        {
                            notificationDto.Actor = _mapper.Map<DTOs.UserDto>(actor);
                        }
                        await _notificationService.SendNotificationToUserAsync(quote.CreatedByUserId, notificationDto);
                    }
                }
            }

            return Result<bool>.Ok(true);
        }
    }
}

