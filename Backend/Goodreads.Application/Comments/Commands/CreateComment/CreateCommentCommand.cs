namespace Goodreads.Application.Comments.Commands.CreateComment;

public record CreateCommentCommand(string Text, string? TargetId) : IRequest<Result<string>>;
