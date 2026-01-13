namespace Goodreads.Application.Comments.Commands.CreateComment;

public record CreateCommentCommand(string Text, string? TargetId, string? TargetType = null) : IRequest<Result<string>>;
