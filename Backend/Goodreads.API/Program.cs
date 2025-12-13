using Goodreads.API.Extensions;
using Goodreads.Application;
using Goodreads.Infrastructure;
using Goodreads.Infrastructure.Configurations;
using Goodreads.Infrastructure.Persistence;
using Hangfire;
using HangfireBasicAuthenticationFilter;
using Goodreads.Application.Common.Interfaces;
using Goodreads.Infrastructure.Repositories;
using Goodreads.Application.Common.Mappings; 

var builder = WebApplication.CreateBuilder(args);


builder.Services.Configure<LocalStorageSettings>(
    builder.Configuration.GetSection(LocalStorageSettings.Section)
);

builder.Services.AddScoped<ILocalStorageService, LocalStorageService>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);
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
    Authorization = new[] { new HangfireCustomBasicAuthenticationFilter(){
        User = "admin",
        Pass = "admin"
    } },
});

HangfireJobsConfigurator.ConfigureRecurringJobs();

app.Run();
