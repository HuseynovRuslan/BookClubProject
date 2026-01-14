using SharedKernel;

namespace Goodreads.Domain.Errors;
public static class MessageErrors
{
    public static Error NotFound(string id) => Error.NotFound(
        "Messages.NotFound",
        $"The message with id '{id}' was not found.");

    public static Error SelfMessage => Error.Validation(
        "Messages.SelfMessage",
        "You cannot send a message to yourself.");

    public static Error NotAuthorized => Error.Forbidden(
        "Messages.NotAuthorized",
        "You can only mark your own received messages as read.");

    public static Error EditNotAuthorized => Error.Forbidden(
        "Messages.EditNotAuthorized",
        "You can only edit your own messages.");
}
