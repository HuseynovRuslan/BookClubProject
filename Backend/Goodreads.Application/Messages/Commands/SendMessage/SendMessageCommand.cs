using Goodreads.Application.DTOs;
using MediatR;
using SharedKernel;

namespace Goodreads.Application.Messages.Commands.SendMessage;
public record SendMessageCommand(string ReceiverId, string Text) : IRequest<Result<MessageDto>>;
