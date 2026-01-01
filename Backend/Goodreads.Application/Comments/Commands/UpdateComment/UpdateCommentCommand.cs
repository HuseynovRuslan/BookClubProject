namespace Goodreads.Application.Comments.Commands.UpdateComment;

public record UpdateCommentCommand(string Id, string Text) : IRequest<Result>;
