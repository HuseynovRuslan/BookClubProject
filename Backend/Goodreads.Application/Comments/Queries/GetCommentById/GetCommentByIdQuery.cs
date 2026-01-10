namespace Goodreads.Application.Comments.Queries.GetCommentById;

public record GetCommentByIdQuery(string Id) : IRequest<Result<CommentDto>>;
