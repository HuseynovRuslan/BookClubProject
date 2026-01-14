using MediatR;
using SharedKernel;

namespace Goodreads.Application.Messages.Commands.DeleteConversation;
public record DeleteConversationCommand(string ConversationId) : IRequest<Result<bool>>;
