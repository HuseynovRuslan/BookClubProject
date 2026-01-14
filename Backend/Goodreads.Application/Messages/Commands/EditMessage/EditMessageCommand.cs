using MediatR;
using SharedKernel;
using Goodreads.Application.DTOs;

namespace Goodreads.Application.Messages.Commands.EditMessage;
public record EditMessageCommand(string MessageId, string Text) : IRequest<Result<MessageDto>>;
