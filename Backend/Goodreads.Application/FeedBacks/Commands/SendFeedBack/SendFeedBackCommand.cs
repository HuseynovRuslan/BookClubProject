namespace Goodreads.Application.FeedBacks.Commands.SendFeedBack;

public class SendFeedBackCommand : IRequest<Result>
{
    public string Subject { get; set; } = default!;
    public string Message { get; set; } = default!;
}
