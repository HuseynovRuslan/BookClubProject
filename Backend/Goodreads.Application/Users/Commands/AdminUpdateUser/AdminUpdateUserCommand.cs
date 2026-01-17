using SharedKernel;
using MediatR;

namespace Goodreads.Application.Users.Commands.AdminUpdateUser;

public record AdminUpdateUserCommand(
    string UserId,
    string? FirstName, 
    string? LastName, 
    string? Email,
    string? UserName) : IRequest<Result>;
