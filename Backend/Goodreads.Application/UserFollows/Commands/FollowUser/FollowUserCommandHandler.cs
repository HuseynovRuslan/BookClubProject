using Goodreads.Application.Notifications.Commands.CreateNotification;
using Goodreads.Application.Common.Interfaces;
using MediatR;

namespace Goodreads.Application.UserFollows.Commands.FollowUser;
internal class FollowUserCommandHandler : IRequestHandler<FollowUserCommand, Result>
{
    private readonly ILogger<FollowUserCommandHandler> _logger;
    private readonly IUserFollowRepository _userFollowRepository;
    private readonly IUserContext _userContext;
    private readonly UserManager<User> _userManager;
    private readonly IMediator _mediator;
    private readonly INotificationService _notificationService;
    private readonly AutoMapper.IMapper _mapper;
    private readonly IUnitOfWork _unitOfWork;

    public FollowUserCommandHandler(
        ILogger<FollowUserCommandHandler> logger,
        IUserFollowRepository userFollowRepository,
        IUserContext userContext,
        UserManager<User> userManager,
        IMediator mediator,
        INotificationService notificationService,
        AutoMapper.IMapper mapper,
        IUnitOfWork unitOfWork)
    {
        _logger = logger;
        _userFollowRepository = userFollowRepository;
        _userContext = userContext;
        _userManager = userManager;
        _mediator = mediator;
        _notificationService = notificationService;
        _mapper = mapper;
        _unitOfWork = unitOfWork;
    }
    public async Task<Result> Handle(FollowUserCommand request, CancellationToken cancellationToken)
    {
        var followerId = _userContext.UserId;
        var followingId = request.FollowingId;
        _logger.LogInformation("User with Id : {FollowerId} following user with Id : {FollowingId}", followerId, followingId);

        if (followerId == null)
            return Result.Fail(AuthErrors.Unauthorized);

        if (followerId == request.FollowingId)
            return Result.Fail(FollowErrors.SelfFollowNotAllowed);

        var follower = await _userManager.FindByIdAsync(followerId);
        if (follower == null)
            return Result.Fail(FollowErrors.UserNotFound(followerId));

        var following = await _userManager.FindByIdAsync(request.FollowingId);
        if (following is null)
            return Result.Fail(FollowErrors.UserNotFound(request.FollowingId));

        var isAlreadyFollowing = await _userFollowRepository.IsFollowingAsync(followerId, followingId);

        if (isAlreadyFollowing)
            return Result.Fail(FollowErrors.AlreadyFollowing(followerId, followingId));

        await _userFollowRepository.FollowAsync(followerId, followingId);

        // Create notification for followed user
        var followerName = $"{follower.FirstName} {follower.LastName}".Trim();
        if (string.IsNullOrWhiteSpace(followerName))
            followerName = follower.UserName ?? "Someone";

        var createNotificationResult = await _mediator.Send(new CreateNotificationCommand(
            UserId: followingId,
            ActorId: followerId,
            Type: NotificationType.UserFollow,
            Title: $"{followerName} started following you",
            RelatedEntityId: followerId,
            RelatedEntityType: "User"
        ));

        // Send real-time notification if user is online
        if (createNotificationResult.IsSuccess && !string.IsNullOrEmpty(createNotificationResult.Data))
        {
            var notification = await _unitOfWork.Notifications.GetByIdAsync(createNotificationResult.Data);
            if (notification != null)
            {
                var notificationDto = _mapper.Map<DTOs.NotificationDto>(notification);
                notificationDto.Actor = _mapper.Map<DTOs.UserDto>(follower);
                await _notificationService.SendNotificationToUserAsync(followingId, notificationDto);
            }
        }

        return Result.Ok();
    }
}
