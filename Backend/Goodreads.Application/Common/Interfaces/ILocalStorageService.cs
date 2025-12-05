public interface ILocalStorageService
{
    Task<(string Url, string BlobName)> UploadAsync(string fileName, Stream data, LocalContainer container);
    string GetUrl(LocalContainer container, string blobName);
    Task DeleteAsync(LocalContainer container, string blobName);
}
