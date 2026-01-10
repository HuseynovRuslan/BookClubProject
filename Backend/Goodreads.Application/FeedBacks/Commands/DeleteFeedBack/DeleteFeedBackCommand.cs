namespace Goodreads.Application.FeedBacks.Commands.DeleteFeedBack;

public record DeleteFeedBackCommand(string Id) : IRequest<Result>;
