using MediatR;
using SharedKernel;

namespace Goodreads.Application.Users.Commands.DeleteUser;
public record DeleteUserCommand(string UserId) : IRequest<Result>;
