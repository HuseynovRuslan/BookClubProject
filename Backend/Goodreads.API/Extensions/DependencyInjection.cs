using Goodreads.API.Middlewares;

namespace Goodreads.API.Extensions;

public static class DependencyInjection
{
    public static IServiceCollection AddPresentation(this IServiceCollection services)
    {
        services.AddControllers();
        services.AddSwaggerWithAuth();
        services.AddExceptionHandler<AuthorizationExceptionHandler>();
        services.AddExceptionHandler<ValidationExceptionHandler>();
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();

        // CORS configuration
        services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
            {
                policy.WithOrigins(
                        // Frontend origins
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
                        "https://localhost:44324")
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials();
            });
        });

        return services;
    }
}
