using SharedKernel;
namespace Goodreads.Domain.Errors;

public static class InformationErrors
{
    public static Error NotFound(string id) => Error.NotFound(
        "Information.NotFound",
        $"The information with the identifier {id} was not found.");
}
