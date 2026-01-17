using Goodreads.API.Hubs;
using Goodreads.API.Middlewares;
using Goodreads.API.Services;
using Goodreads.Application.Common.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace Goodreads.API.Extensions;

public static class DependencyInjection
{
    public static IServiceCollection AddPresentation(this IServiceCollection services)
    {
        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
            });
        services.AddSwaggerWithAuth();
        services.AddExceptionHandler<AuthorizationExceptionHandler>();
        services.AddExceptionHandler<ValidationExceptionHandler>();
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();

       
        services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
            {
                policy.WithOrigins(
                        
                        "http://localhost:5173", 
                        "https://localhost:5173",
                        "http://localhost:3000", 
                        "https://localhost:3000",
                        "http://localhost:5174",
                        "https://localhost:5174",
                        "http://localhost:5175",
                        "https://localhost:5175",
                        
                        "http://localhost:5062",
                        "https://localhost:7050",
                        "http://localhost:15357",
                        "https://localhost:44324",
                     
                        "http://98.89.30.178:5173")
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials();
            });
        });

        
        services.AddSignalR(options =>
        {
            options.EnableDetailedErrors = true; 
        });
        services.AddSingleton<IUserIdProvider, UserIdProvider>();
        
        
        services.AddScoped<IMessageNotificationService, MessageNotificationService>();
        services.AddScoped<INotificationService, NotificationService>();

        return services;
    }
}
