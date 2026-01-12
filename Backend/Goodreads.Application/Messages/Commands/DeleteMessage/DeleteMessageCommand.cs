using MediatR;
using SharedKernel;

namespace Goodreads.Application.Messages.Commands.DeleteMessage;
public record DeleteMessageCommand(string MessageId) : IRequest<Result<bool>>;
