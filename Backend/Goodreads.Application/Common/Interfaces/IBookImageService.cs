namespace Goodreads.Application.Common.Interfaces;

public interface IBookImageService
{
    string GetCoverImageUrl(string? coverImageUrl, string? isbn, string? coverImageBlobName);
}
