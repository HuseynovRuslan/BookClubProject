using Goodreads.Application.Common.Responses;
using MediatR;
using SharedKernel;

namespace Goodreads.Application.Posts.Commands.ToggleSavePost;

public record ToggleSavePostCommand(string PostId, string PostType)
    : IRequest<Result<bool>>;
