# =============================================================================
# ASP.NET Core 8 Backend Dockerfile - Production Ready
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build
# -----------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files first for better layer caching
COPY Goodreads.sln ./
COPY Directory.Build.props ./
COPY Directory.Build.targets ./

# Copy all project files
COPY SharedKernel/SharedKernel.csproj SharedKernel/
COPY Goodreads.Domain/Goodreads.Domain.csproj Goodreads.Domain/
COPY Goodreads.Application/Goodreads.Application.csproj Goodreads.Application/
COPY Goodreads.Infrastructure/Goodreads.Infrastructure.csproj Goodreads.Infrastructure/
COPY Goodreads.API/Goodreads.API.csproj Goodreads.API/

# Restore dependencies
RUN dotnet restore Goodreads.sln

# Copy source code
COPY . .

# Build the application
RUN dotnet build Goodreads.API/Goodreads.API.csproj -c Release --no-restore

# Publish the application
RUN dotnet publish Goodreads.API/Goodreads.API.csproj -c Release -o /app/publish --no-build

# -----------------------------------------------------------------------------
# Stage 2: Runtime
# -----------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Create non-root user for security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Install curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copy published files
COPY --from=build /app/publish .

# Create directory for uploaded files and set permissions
RUN mkdir -p /app/wwwroot/uploads && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port (ASP.NET Core defaults to 8080 in containers)
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Entry point
ENTRYPOINT ["dotnet", "Goodreads.API.dll"]
