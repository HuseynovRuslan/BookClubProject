# BookClub Project

A modern, full-stack book sharing and social reading platform inspired by Goodreads. Built with ASP.NET Core and React.

## Features

- **Book Management**: Add books to shelves, track reading progress, manage personal library
- **User Profiles**: Customizable profiles with avatars, bios, and social links
- **Reviews & Comments**: Write and share book reviews with rating system
- **Quote Sharing**: Share favorite quotes from books with the community
- **Search & Discovery**: Advanced search for books, authors, and users
- **Reading Statistics**: Track reading progress and annual reading challenges
- **Social Features**: Follow users, like posts, comment on reviews and quotes
- **Admin Panel**: Comprehensive admin interface for managing books, authors, and genres
- **Responsive Design**: Modern, mobile-friendly UI with Tailwind CSS

## Technology Stack

**Backend:**
- ASP.NET Core 8.0
- Entity Framework Core
- SQL Server
- JWT Authentication
- Clean Architecture with CQRS pattern
- MediatR, AutoMapper
- Swagger/OpenAPI

**Frontend:**
- React 18
- Vite
- React Router v7
- Tailwind CSS 4
- React Context API

## Prerequisites

- .NET 8.0 SDK or later
- Node.js 18+ and npm
- SQL Server (Express edition or higher)

## Installation

### Backend Setup

1. **Configure Database Connection**
   
   Update `Backend/Goodreads.API/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Your SQL Server connection string"
     }
   }
   ```

2. **Run Database Migrations**
   ```bash
   cd Backend/Goodreads.API
   dotnet ef database update
   ```
   
   Or set `RunMigrations: true` in `appsettings.json` to auto-run migrations on startup.

3. **Run the Backend**
   ```bash
   dotnet run
   ```
   
   API will be available at `https://localhost:7050`
   Swagger UI: `https://localhost:7050/swagger`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd Frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Frontend will be available at `http://localhost:5173`

## Default Admin Account

- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@goodreads.com`

## Project Structure

```
BookClubProject/
├── Backend/
│   ├── Goodreads.API/              # Web API layer
│   ├── Goodreads.Application/      # Business logic
│   ├── Goodreads.Domain/           # Domain entities
│   ├── Goodreads.Infrastructure/  # Data access
│   └── SharedKernel/               # Shared logic
└── Frontend/
    └── src/
        ├── components/             # React components
        ├── api/                   # API client
        ├── context/               # Context providers
        └── utils/                 # Utilities
```

## Quick Start

1. **Start Backend:**
   ```bash
   cd Backend/Goodreads.API
   dotnet run
   ```

2. **Start Frontend:**
   ```bash
   cd Frontend
   npm run dev
   ```

3. **Make sure:**
   - SQL Server is running
   - Database connection string is correct
   - Run migrations: `dotnet ef database update` (or set `RunMigrations: true`)

## API Documentation

Once the backend is running, access Swagger UI at:
```
https://localhost:7050/swagger
```

---

**Built with ASP.NET Core and React**
