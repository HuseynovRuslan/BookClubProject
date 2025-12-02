using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using Goodreads.Application.Common.Interfaces;
using Goodreads.Domain.Constants;
using Microsoft.Extensions.Options;

namespace Goodreads.Infrastructure.Services.Storage;

public class AwsBlobStorageService(IOptions<BlobStorageSettings> options) : IBlobStorageService
{
    private readonly BlobStorageSettings settings = options.Value;

    private AmazonS3Client CreateClient()
    {
        return new AmazonS3Client(
            settings.AccountName,     // AccessKey
            settings.AccountKey,      // SecretKey
            RegionEndpoint.GetBySystemName(settings.ConnectionString) // Region ayarı
        );
    }

    public async Task<(string Url, string BlobName)> UploadAsync(string fileName, Stream data, BlobContainer container)
    {
        var s3 = CreateClient();

        string folder = GetFolderName(container);
        string blobName = $"{folder}/{Guid.NewGuid()}{Path.GetExtension(fileName)}";

        var request = new PutObjectRequest
        {
            BucketName = settings.ContainerName,   // BucketName
            Key = blobName,
            InputStream = data,
            AutoCloseStream = false,
            ContentType = GetContentType(fileName)
        };

        await s3.PutObjectAsync(request);

        string url = $"https://{settings.ContainerName}.s3.{settings.ConnectionString}.amazonaws.com/{blobName}";

        return (url, blobName);
    }

    public async Task DeleteAsync(string blobName)
    {
        if (string.IsNullOrEmpty(blobName))
            return;

        var s3 = CreateClient();

        await s3.DeleteObjectAsync(new DeleteObjectRequest
        {
            BucketName = settings.ContainerName,
            Key = blobName
        });
    }

    public string? GetUrl(string blobName)
    {
        if (string.IsNullOrEmpty(blobName))
            return null;

        var s3 = CreateClient();

        // 1 saatlıq pre-signed URL
        var request = new GetPreSignedUrlRequest
        {
            BucketName = settings.ContainerName,
            Key = blobName,
            Expires = DateTime.UtcNow.AddHours(1)
        };

        return s3.GetPreSignedURL(request);
    }

    private static string GetContentType(string fileName)
    {
        string ext = Path.GetExtension(fileName).ToLower();

        return ext switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            _ => "application/octet-stream"
        };
    }

    private string GetFolderName(BlobContainer container)
    {
        return container switch
        {
            BlobContainer.Users => "users",
            BlobContainer.Authors => "authors",
            BlobContainer.Books => "books",
            _ => "others"
        };
    }
}
