using MediatR;
using SharedKernel;

namespace Goodreads.Application.Messages.Commands.MarkAsRead;
public record MarkAsReadCommand(string MessageId) : IRequest<Result<bool>>;
