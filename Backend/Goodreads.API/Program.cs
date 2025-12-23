using Goodreads.API.Extensions;
using Goodreads.Application;
using Goodreads.Application.Common.Interfaces;
using Goodreads.Application.Common.Mappings;
using Goodreads.Infrastructure;
using Goodreads.Infrastructure.Configurations;
using Goodreads.Infrastructure.Persistence;
using Goodreads.Infrastructure.Repositories;
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
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssemblyContaining<
        Goodreads.Application.Books.Commands.CreateBook.CreateBookCommandHandler>());

builder.Services
    .AddPresentation()
    .AddApplication()
    .AddInfrastructure(builder.Configuration);

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Goodreads-Clone API v1");
    });
}

if (builder.Configuration.GetValue<bool>("RunMigrations"))
{
    await app.ApplyMigrationsAsync<ApplicationDbContext>();
    await app.SeedDataAsync();
}

app.UseExceptionHandler();

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


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

HangfireJobsConfigurator.ConfigureRecurringJobs();


app.Run();
