using Goodreads.Application.Common.Interfaces;
using Goodreads.Domain.Constants;
using Microsoft.AspNetCore.Hosting;

namespace Goodreads.Infrastructure.Services;

public class BookImageService : IBookImageService
{
    private readonly IWebHostEnvironment _env;
    private readonly ILocalStorageService _localStorageService;

    public BookImageService(IWebHostEnvironment env, ILocalStorageService localStorageService)
    {
        _env = env;
        _localStorageService = localStorageService;
    }

    public string? GetCoverImageUrl(string? coverImageUrl, string? isbn, string? coverImageBlobName)
    {
       
        if (!string.IsNullOrEmpty(coverImageBlobName))
        {
          
            return _localStorageService.GetUrl(LocalContainer.Books, coverImageBlobName);
        }

        
        if (!string.IsNullOrEmpty(coverImageUrl))
        {
            if (coverImageUrl.StartsWith("http://") || coverImageUrl.StartsWith("https://"))
            {
                return coverImageUrl;
            }
            
           
            if (coverImageUrl.StartsWith("/"))
            {
                return coverImageUrl;
            }
       
            return $"/{coverImageUrl}";
        }

        if (!string.IsNullOrEmpty(isbn))
        {
            var cleanIsbn = isbn.Replace("-", "").Replace(" ", "").Trim();
            if (!string.IsNullOrEmpty(cleanIsbn))
            {
                return $"https://covers.openlibrary.org/b/isbn/{cleanIsbn}-L.jpg";
            }
        }

        return null;
    }
}
