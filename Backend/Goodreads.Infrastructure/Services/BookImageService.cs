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

    public string GetCoverImageUrl(string? coverImageUrl, string? isbn, string? coverImageBlobName)
    {
        // 1. ƏVVƏLCƏ lokal şəkil yoxla (coverImageBlobName)
        if (!string.IsNullOrEmpty(coverImageBlobName))
        {
            var localPath = Path.Combine(_env.WebRootPath ?? _env.ContentRootPath, "books", coverImageBlobName);
            
            if (File.Exists(localPath))
            {
                var localUrl = _localStorageService.GetUrl(LocalContainer.Books, coverImageBlobName);
                return localUrl;
            }
        }

        // 2. Əgər lokal path varsa (coverImageUrl lokal path-dirsə), yoxla
        if (!string.IsNullOrEmpty(coverImageUrl) && 
            !coverImageUrl.StartsWith("http://") && 
            !coverImageUrl.StartsWith("https://"))
        {
            // Local path formatı: /books/filename.jpg
            var fileName = coverImageUrl.TrimStart('/').Replace("books/", "");
            var localPath = Path.Combine(_env.WebRootPath ?? _env.ContentRootPath, "books", fileName);
            
            if (File.Exists(localPath))
            {
                return coverImageUrl;
            }
        }

        // 3. Əgər lokal şəkil yoxdursa, OpenLibrary-dən götür (ISBN varsa)
        if (!string.IsNullOrEmpty(isbn))
        {
            // ISBN-dən xüsusi simvolları təmizlə
            var cleanIsbn = isbn.Replace("-", "").Replace(" ", "").Trim();
            if (!string.IsNullOrEmpty(cleanIsbn))
            {
                return $"https://covers.openlibrary.org/b/isbn/{cleanIsbn}-L.jpg";
            }
        }

        // 4. Əgər artıq OpenLibrary URL-dirsə (lokal şəkil yoxdursa), olduğu kimi qaytar
        if (!string.IsNullOrEmpty(coverImageUrl) && 
            (coverImageUrl.StartsWith("http://") || coverImageUrl.StartsWith("https://")))
        {
            return coverImageUrl;
        }

        // 5. Heç biri yoxdursa, null qaytar
        return null;
    }
}
