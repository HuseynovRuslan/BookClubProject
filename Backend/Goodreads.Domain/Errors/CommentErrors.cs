using SharedKernel;

namespace Goodreads.Domain.Errors;

public static class CommentErrors
{
    public static Error NotFound(string id) => Error.NotFound(
        "Comment.NotFound",
        $"The comment with the identifier {id} was not found.");
}
