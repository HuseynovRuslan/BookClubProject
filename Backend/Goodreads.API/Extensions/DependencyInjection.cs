
namespace Goodreads.API.Extensions;

public static class DependencyInjection
{
    public static IServiceCollection AddPresentation(this IServiceCollection services)
    {
        services.AddControllers();
        services.AddSwaggerWithAuth();
        //services.AddExceptionHandler<AuthorizationExceptionHandler>();
        //services.AddExceptionHandler<ValidationExceptionHandler>();
        //services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();

        // CORS configuration
        services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
            {
                policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:5174")
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials();
            });
        });

        return services;
    }
}
