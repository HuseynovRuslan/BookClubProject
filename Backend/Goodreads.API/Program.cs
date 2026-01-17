using Goodreads.API.Extensions;
using Goodreads.API.Hubs;
using Goodreads.Application;
using Goodreads.Application.Common.Interfaces;
using Goodreads.Application.Common.Mappings;
using Goodreads.Infrastructure;
using Goodreads.Infrastructure.Configurations;
using Goodreads.Infrastructure.Persistence;
using Goodreads.Infrastructure.Repositories;
using Goodreads.Infrastructure.Services;
using Goodreads.Infrastructure.Services.EmailService;
using Hangfire;
using HangfireBasicAuthenticationFilter;

var builder = WebApplication.CreateBuilder(args);


builder.Services.Configure<LocalStorageSettings>(
    builder.Configuration.GetSection(LocalStorageSettings.Section));

builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection(EmailSettings.Section));

builder.Services.AddScoped<IApplicationDbContext, ApplicationDbContext>();
builder.Services.AddScoped<ILocalStorageService, LocalStorageService>();
builder.Services.AddScoped<IBookImageService, BookImageService>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

builder.Services
    .AddPresentation()
    .AddApplication()
    .AddInfrastructure(builder.Configuration);

var app = builder.Build();

// Enable Swagger in all environments for Docker testing
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Goodreads-Clone API v1");
});

// Run migrations if enabled (with retry logic for Docker)
if (builder.Configuration.GetValue<bool>("RunMigrations"))
{
    app.Logger.LogInformation("RunMigrations is enabled. Starting migration process...");
    await app.ApplyMigrationsAsync<ApplicationDbContext>();
    await app.SeedDataAsync();
    app.Logger.LogInformation("Migration process completed. Continuing with app startup...");
}
else
{
    app.Logger.LogInformation("RunMigrations is disabled. Skipping migrations.");
}

app.UseExceptionHandler();

// CORS must be before UseHttpsRedirection for SignalR
app.UseCors("AllowFrontend");

// HTTPS redirection
// app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<MessagesHub>("/hubs/messages");
app.MapHub<NotificationsHub>("/hubs/notifications");


app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[]
    {
        new HangfireCustomBasicAuthenticationFilter
        {
            User = builder.Configuration["Hangfire:Username"] ?? "admin",
            Pass = builder.Configuration["Hangfire:Password"] ?? "admin"
        }
    }
});

try 
{
    HangfireJobsConfigurator.ConfigureRecurringJobs();
}
catch (Exception ex)
{
    app.Logger.LogWarning("Hangfire recurring jobs could not be configured: {Message}. They will be configured on next app restart.", ex.Message);
}

app.Logger.LogInformation("Application startup complete. Starting web server on {Urls}", 
    builder.Configuration["ASPNETCORE_URLS"] ?? "default ports");

app.Run();
