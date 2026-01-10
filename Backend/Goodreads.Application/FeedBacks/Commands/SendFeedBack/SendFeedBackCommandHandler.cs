namespace Goodreads.Application.FeedBacks.Commands.SendFeedBack;

internal class SendFeedBackCommandHandler : IRequestHandler<SendFeedBackCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IUserContext _userContext;
    private readonly ILogger<SendFeedBackCommandHandler> _logger;

    public SendFeedBackCommandHandler(IApplicationDbContext context, IUserContext userContext, ILogger<SendFeedBackCommandHandler> logger)
    {
        _context = context;
        _userContext = userContext;
        _logger = logger;
    }

    public async Task<Result> Handle(SendFeedBackCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
        {
            return Result.Fail(AuthErrors.Unauthorized);
        }

        var feedback = new FeedBack
        {
            UserId = userId,
            Subject = request.Subject,
            Message = request.Message
        };

        _context.FeedBacks.Add(feedback);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} sent a feedback.", userId);

        return Result.Ok();
    }
}
