namespace Goodreads.Application.DTOs;

public record CommentDto(
    string Id,
    string Text,
    string UserId,
    string UserName,
    string? UserProfilePicture,
    string? TargetId,
    DateTime CreatedAt);
