namespace Goodreads.Application.News.Commands.CreateNews;

public record CreateInformationCommand(string Title, string Content, string Details, string CoverImageUrl) : IRequest<Result<string>>;
