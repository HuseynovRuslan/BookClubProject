using Microsoft.EntityFrameworkCore;

namespace Goodreads.API.Extensions;

public static class MigrationExtensions
{
    public static async Task ApplyMigrationsAsync<TContext>(this IApplicationBuilder app, int maxRetries = 5, int delaySeconds = 5)
    where TContext : DbContext
    {
        using var scope = app.ApplicationServices.CreateScope();

        var logger = scope.ServiceProvider.GetRequiredService<ILogger<TContext>>();
        var dbContext = scope.ServiceProvider.GetRequiredService<TContext>();

        for (int retry = 0; retry < maxRetries; retry++)
        {
            try
            {
                logger.LogInformation("Starting database migration for {DbContext} (attempt {Attempt}/{MaxRetries})", 
                    typeof(TContext).Name, retry + 1, maxRetries);
                
                
                await dbContext.Database.MigrateAsync();
                logger.LogInformation("Database migration completed successfully for {DbContext}", typeof(TContext).Name);
                return;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Migration attempt {Attempt}/{MaxRetries} failed for {DbContext}", 
                    retry + 1, maxRetries, typeof(TContext).Name);
            }

            if (retry < maxRetries - 1)
            {
                logger.LogInformation("Waiting {Delay} seconds before retry...", delaySeconds);
                await Task.Delay(TimeSpan.FromSeconds(delaySeconds));
            }
        }

        logger.LogError("All {MaxRetries} migration attempts failed for {DbContext}. The application will continue without migrations. " +
            "Please ensure the database is available and run migrations manually.", maxRetries, typeof(TContext).Name);
    }
}
