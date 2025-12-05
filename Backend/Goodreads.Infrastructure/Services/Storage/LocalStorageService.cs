using Goodreads.Application.Common.Interfaces;
using Goodreads.Domain.Constants;
using Microsoft.AspNetCore.Hosting;

public class LocalStorageService : ILocalStorageService
{
    private readonly IWebHostEnvironment _env;

    public LocalStorageService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<(string Url, string BlobName)> UploadAsync(string fileName, Stream stream, LocalContainer container)
    {
        var folderName = container.ToString().ToLower();  

        var uploadsFolder = Path.Combine(_env.WebRootPath, folderName);

        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = Guid.NewGuid() + Path.GetExtension(fileName);
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await stream.CopyToAsync(fileStream);
        }

        var url = $"/{folderName}/{uniqueFileName}";
        return (url, uniqueFileName);
    }
    public string GetUrl(LocalContainer container, string blobName)
    {
        var folderName = container.ToString().ToLower();
        return $"/{folderName}/{blobName}";
    }

    public Task DeleteAsync(LocalContainer container, string blobName)
    {
        var folderName = container.ToString().ToLower();
        var path = Path.Combine(_env.WebRootPath, folderName, blobName);

        if (File.Exists(path))
            File.Delete(path);

        return Task.CompletedTask;
    }
}
