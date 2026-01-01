namespace Goodreads.Application.News.Commands.DeleteInformation;

public record DeleteInformationCommand(string Id) : IRequest<Result>;
