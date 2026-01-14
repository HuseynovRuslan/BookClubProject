using SharedKernel;

namespace Goodreads.Domain.Errors;
public static class ConversationErrors
{
    public static Error NotFound(string id) => Error.NotFound(
        "Conversations.NotFound",
        $"The conversation with id '{id}' was not found.");

    public static Error NotAuthorized => Error.Forbidden(
        "Conversations.NotAuthorized",
        "You are not authorized to modify this conversation.");
}
