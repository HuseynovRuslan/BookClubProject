using Goodreads.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Goodreads.Infrastructure.Jobs;
public class RefreshTokenCleanupJob
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<RefreshTokenCleanupJob> _logger;

    public RefreshTokenCleanupJob(ApplicationDbContext context, ILogger<RefreshTokenCleanupJob> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task RunAsync()
    {
        try
        {
            var deletedCount = await _context.RefreshTokens
                .Where(x => (x.IsUsed || x.IsRevoked) && x.ExpiryDate < DateTime.UtcNow)
                .ExecuteDeleteAsync();

            _logger.LogInformation("Deleted {Count} expired refresh tokens", deletedCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while cleaning up refresh tokens");
            throw;
        }
    }
}

