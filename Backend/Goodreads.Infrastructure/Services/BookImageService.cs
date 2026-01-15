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
        // 1. ƏVVƏLCƏ lokal şəkil yoxla (coverImageBlobName) - özümüz yaratdığımız kitablar üçün
        // coverImageBlobName varsa, bu bizim yüklədiyimiz şəkil deməkdir
        if (!string.IsNullOrEmpty(coverImageBlobName))
        {
            // LocalStorageService-dən URL al - format: /books/{blobName}
            return _localStorageService.GetUrl(LocalContainer.Books, coverImageBlobName);
        }

        // 2. Əgər lokal path varsa (coverImageUrl lokal path-dirsə), direkt qaytar
        if (!string.IsNullOrEmpty(coverImageUrl))
        {
            // Əgər artıq HTTP/HTTPS URL-dirsə (OpenLibrary və ya başqa), olduğu kimi qaytar
            if (coverImageUrl.StartsWith("http://") || coverImageUrl.StartsWith("https://"))
            {
                return coverImageUrl;
            }
            
            // Local path formatı: /books/filename.jpg və ya books/filename.jpg
            // Əgər artıq / ilə başlayırsa, olduğu kimi qaytar
            if (coverImageUrl.StartsWith("/"))
            {
                return coverImageUrl;
            }
            
            // Əgər / yoxdursa, əlavə et
            return $"/{coverImageUrl}";
        }

        // 3. Əgər lokal şəkil yoxdursa, OpenLibrary-dən götür (ISBN varsa) - yalnız fallback kimi
        if (!string.IsNullOrEmpty(isbn))
        {
            // ISBN-dən xüsusi simvolları təmizlə
            var cleanIsbn = isbn.Replace("-", "").Replace(" ", "").Trim();
            if (!string.IsNullOrEmpty(cleanIsbn))
            {
                return $"https://covers.openlibrary.org/b/isbn/{cleanIsbn}-L.jpg";
            }
        }

        // 4. Heç biri yoxdursa, null qaytar
        return null;
    }
}
