# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY *.sln .
COPY Goodreads.API/*.csproj ./Goodreads.API/
COPY Goodreads.Application/*.csproj ./Goodreads.Application/
COPY Goodreads.Domain/*.csproj ./Goodreads.Domain/
COPY Goodreads.Infrastructure/*.csproj ./Goodreads.Infrastructure/
COPY SharedKernel/*.csproj ./SharedKernel/

RUN dotnet restore

# Copy everything else and build
COPY . .
WORKDIR /src/Goodreads.API
RUN dotnet publish -c Release -o /app/out

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/out .

EXPOSE 8080

ENTRYPOINT ["dotnet", "Goodreads.API.dll"]
