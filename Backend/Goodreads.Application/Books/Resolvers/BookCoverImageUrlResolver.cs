using AutoMapper;
using Goodreads.Application.Common.Interfaces;
using Goodreads.Domain.Entities;

namespace Goodreads.Application.Books.Resolvers;

public class BookCoverImageUrlResolver : IValueResolver<Book, object, string?>
{
    private readonly IBookImageService _bookImageService;

    public BookCoverImageUrlResolver(IBookImageService bookImageService)
    {
        _bookImageService = bookImageService;
    }

    public string? Resolve(Book source, object destination, string? destMember, ResolutionContext context)
    {
        return _bookImageService.GetCoverImageUrl(
            source.CoverImageUrl, 
            source.ISBN, 
            source.CoverImageBlobName
        );
    }
}
