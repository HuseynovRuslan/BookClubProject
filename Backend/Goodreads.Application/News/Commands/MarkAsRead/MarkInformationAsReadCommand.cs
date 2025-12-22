using MediatR;
using SharedKernel;
namespace Goodreads.Application.News.Commands.MarkAsRead;

public record MarkInformationAsReadCommand(string Id) : IRequest<Result>;
