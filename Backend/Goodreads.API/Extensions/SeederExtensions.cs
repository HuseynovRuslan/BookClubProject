using Goodreads.Infrastructure.Persistence.Seeders;

namespace Goodreads.API.Extensions;

public static class SeederExtensions
{
    public static async Task SeedDataAsync(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();

        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppSeeder>>();
        
        try
        {
            var seeder = scope.ServiceProvider.GetRequiredService<AppSeeder>();
            logger.LogInformation("Starting database seeding...");
            await seeder.SeedAsync();
            logger.LogInformation("Database seeding completed.");
        }
        catch (Exception ex)
        {
            // Log error but don't crash the app - seeding is not critical for app to run
            logger.LogError(ex, "An error occurred during database seeding. The application will continue without seeding.");
        }
    }
}