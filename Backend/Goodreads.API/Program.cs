using Goodreads.API.Extensions;
using Goodreads.Application;
using Goodreads.Infrastructure;
using Goodreads.Infrastructure.Configurations;
using Goodreads.Infrastructure.Persistence;
using Hangfire;
using HangfireBasicAuthenticationFilter;
//using Scalar.AspNetCore;
using Goodreads.Application.Common.Interfaces; // IBlobStorageService
using Goodreads.Infrastructure.Repositories;
using Goodreads.Application.Common.Mappings; // AwsBlobStorageService

var builder = WebApplication.CreateBuilder(args);


// Bind BlobStorage settings (AWS)
builder.Services.Configure<LocalStorageSettings>(
    builder.Configuration.GetSection(LocalStorageSettings.Section)
);

builder.Services.AddScoped<ILocalStorageService, LocalStorageService>();

// Register UnitOfWork and other services
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

// MediatR handlers
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssemblyContaining<Goodreads.Application.Books.Commands.CreateBook.CreateBookCommandHandler>()
);

builder.Services
    .AddPresentation()
    .AddApplication()
    .AddInfrastructure(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    //app.MapScalarApiReference(options =>
    //{
    //    options.Title = "Goodreads API";
    //    options.OpenApiRoutePattern = "/swagger/v1/swagger.json";
    //});
}

if (builder.Configuration.GetValue<bool>("RunMigrations"))
{
    await app.ApplyMigrationsAsync<ApplicationDbContext>();
    await app.SeedDataAsync();
}

app.UseExceptionHandler();

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowFrontend");

// Enable static files for images
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new HangfireCustomBasicAuthenticationFilter(){
        User = "admin",
        Pass = "admin"
    } },
});

HangfireJobsConfigurator.ConfigureRecurringJobs();

app.Run();
