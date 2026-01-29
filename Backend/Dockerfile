
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src


COPY *.sln .
COPY Goodreads.API/*.csproj ./Goodreads.API/
COPY Goodreads.Application/*.csproj ./Goodreads.Application/
COPY Goodreads.Domain/*.csproj ./Goodreads.Domain/
COPY Goodreads.Infrastructure/*.csproj ./Goodreads.Infrastructure/
COPY SharedKernel/*.csproj ./SharedKernel/

RUN dotnet restore


COPY . .
WORKDIR /src/Goodreads.API
RUN dotnet publish -c Release -o /app/out


FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/out .

EXPOSE 8080

ENTRYPOINT ["dotnet", "Goodreads.API.dll"]
