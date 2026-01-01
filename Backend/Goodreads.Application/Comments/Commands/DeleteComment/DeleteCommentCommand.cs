namespace Goodreads.Application.Comments.Commands.DeleteComment;

public record DeleteCommentCommand(string Id) : IRequest<Result>;
