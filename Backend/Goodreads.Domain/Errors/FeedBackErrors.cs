using SharedKernel;

namespace Goodreads.Domain.Errors;

public static class FeedBackErrors
{
    public static Error NotFound(string id) => Error.NotFound(
        "FeedBack.NotFound",
        $"FeedBack with ID '{id}' was not found.");
}
