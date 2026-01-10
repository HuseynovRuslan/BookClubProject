namespace Goodreads.Application.Users.Queries.GetProfileById;
public record GetProfileByIdQuery(string UserId) : IRequest<Result<UserProfileDto>>;
