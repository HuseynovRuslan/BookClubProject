# 📚 BookClub Project 

BookClub is a social platform for book lovers, allowing users to discover books, track reading progress, and interact with a community of readers.

## 🚀 Technologies

### Backend
- **ASP.NET Core 8 Web API** - RESTful API
- **Entity Framework Core** - ORM
- **SQL Server** - Database
- **Hangfire** - Background jobs
- **MediatR** - CQRS pattern implementation
- **Docker** - Containerization support

### Frontend
- **React** (Vite)
- **TailwindCSS** - Styling
- **Axios** - API requests
- **SignalR** - Real-time updates

## 🛠 Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js & npm
- SQL Server (or Docker for containerized DB)

### Compilation & Run

#### Backend
1. Navigate to the API directory:
   ```bash
   cd Backend/Goodreads.API
   ```
2. Update database (apply migrations):
   ```bash
   dotnet ef database update
   ```
3. Run the application:
   ```bash
   dotnet run
   ```

#### Frontend
1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## ✨ Features
- **User Authentication**: Secure login and registration.
- **Book Recommendations**: AI-powered book suggestions.
- **Social Feed**: See what your friends are reading and reviewing.
- **Bookshelves**: Organize books into 'Want to Read', 'Currently Reading', and 'Read'.
- **Community**: Comment, like, and share reviews.

## 🐳 Docker Support
You can run the entire stack using Docker Compose:
```bash
docker-compose up -d
```
