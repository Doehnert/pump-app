# Pump Master Web Application - Technical Assessment

## Project Overview

Pump Master is a web-based platform for agricultural customers to manage pump assets. Built with .NET Core backend and React frontend, featuring secure authentication, pump management, search/filtering, and real-time monitoring.

## Quick Start

### Prerequisites
- .NET 8.0 SDK
- Node.js 18+ and npm
- Git

### Backend Setup
```bash
cd pump_api
dotnet restore
dotnet ef database update  # Creates and seeds the database
dotnet run                 # Runs on http://localhost:5073
```

### Frontend Setup
```bash
cd pump-frontend-app
npm install
npm run dev              # Runs on http://localhost:5173
```

### Default Login
- **Username**: admin
- **Password**: admin123

## Architecture & Technology Stack

### Backend (.NET Core 8.0)
- **Entity Framework Core**: ORM with SQLite
- **JWT Authentication**: Secure API access
- **AutoMapper**: Object mapping
- **System.Linq.Dynamic.Core**: Dynamic query building
- **Clean Architecture**: Controllers → Services → Data layers

## Database Setup & Entity Framework

### Prerequisites
- .NET 8.0 SDK
- SQLite (included with .NET Core)

### Initial Setup

1. **Navigate to the backend directory:**
   ```bash
   cd pump_api
   ```

2. **Install Entity Framework tools (if not already installed):**
   ```bash
   dotnet tool install --global dotnet-ef
   ```

3. **Create the initial migration:**
   ```bash
   dotnet ef migrations add InitialCreate
   ```

4. **Apply migrations to create the database:**
   ```bash
   dotnet ef database update
   ```

### Database Schema

The application uses SQLite with the following main entities:

- **Users**: Authentication and role management
- **Pumps**: Core pump asset data
- **PumpInspections**: Historical inspection records
- **RefreshTokens**: JWT refresh token management

### Working with Migrations

**Add a new migration after model changes:**
```bash
dotnet ef migrations add AddNewFeature
```

**Update database with latest migrations:**
```bash
dotnet ef database update
```

**Remove last migration (if not applied):**
```bash
dotnet ef migrations remove
```

**Generate SQL script for production:**
```bash
dotnet ef migrations script
```

### Database Seeding

The application includes a `DatabaseSeeder` that creates:
- Default admin user (admin/admin123)
- Sample pump data
- Test inspection records

**Automatic Seeding:**
The seeder runs automatically on first startup when the database is empty.

**Manual Seeding via API (Development Only):**
```bash
# Seed all data
curl -X POST http://localhost:5073/api/dev/seed

# Seed only users
curl -X POST http://localhost:5073/api/dev/seed-users

# Seed only pumps
curl -X POST http://localhost:5073/api/dev/seed-pumps

# Clear all data
curl -X DELETE http://localhost:5073/api/dev/clear

# Get database stats
curl -X GET http://localhost:5073/api/dev/stats
```

**Note:** These endpoints are only available in development environment.

### Connection String

The database connection is configured in `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=pump_api.db"
  }
}
```

### Development vs Production

- **Development**: SQLite file (`pump_api.db`)
- **Production**: Azure SQL Database or SQL Server
- **Testing**: In-memory database for unit tests

### Frontend (React + TypeScript)
- **Material-UI**: Professional UI components
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **React Hook Form + Yup**: Form validation
- **Recharts**: Data visualization
- **React Leaflet**: Interactive maps

## Key Features Implemented

### ✅ Authentication & Security
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, FarmManager, Technician, Inspector)
- Protected routes and API endpoints

### ✅ Pump Management
- CRUD operations with real-time search
- Dynamic sorting (click column headers)
- Pagination with configurable page sizes
- Advanced filtering capabilities

### ✅ Data Visualization
- Pressure history charts (line/bar)
- Interactive maps with pump locations
- Dashboard with summary metrics

## Technical Challenges Solved

### 1. Dynamic Query Building
Created a generic `QueryBuilderService` :
```csharp
public async Task<PaginatedResult<T>> GetPagedResultAsync<T>(
    IQueryable<T> query,
    QueryParameters parameters,
    Dictionary<string, string> allowedSortFields,
    Dictionary<string, string> allowedFilterFields)
```

### 2. Frontend-Backend Integration
- Consistent API response formats
- TypeScript interfaces for type safety
- Error handling and loading states

### 3. State Management
- React Context for global authentication state
- Local state for component-specific data
- Optimized re-rendering

## Development Timeline

### Phase 1: Core Foundation (✅ Complete) - 2 weeks
- Authentication system
- Basic CRUD operations
- Database schema
- API endpoints

### Phase 2: Advanced Features (🔄 In Progress) - 3 weeks
- Search and filtering
- Sorting and pagination
- Data visualization
- Interactive maps

### Phase 3: Production Readiness - 2 weeks
- Performance optimization
- Security hardening
- Comprehensive testing

### Phase 4: Enhancement & Scale - 3 weeks
- Mobile PWA
- Advanced analytics
- Multi-tenant support

**Total Estimated Effort**: 10 weeks

## Testing Strategy

### Backend Testing
- Unit tests for service layer
- Integration tests for API endpoints
- Mock testing for external dependencies

### Frontend Testing
- Component testing
- Integration testing
- E2E testing with user workflows

## Deployment Strategy

### Development
- Local SQLite database
- Hot reload with Vite
- Git version control

### Production (Azure)
- App Service for backend
- Azure SQL Database
- Azure Storage for frontend
- Application Insights monitoring

## Security Considerations

- JWT tokens with refresh mechanism
- Role-based access control
- Input validation and sanitization
- CORS configuration
- HTTPS enforcement

## Performance Optimizations

- Database query optimization
- Frontend code splitting
- Bundle size optimization
- Caching strategies

## Future Enhancements

- Real-time monitoring with WebSockets
- Mobile PWA capabilities
- Advanced analytics with ML
- Multi-tenant architecture
- IoT integration for direct pump communication

---

**Technology Stack**: .NET Core + React + TypeScript  
**Deployment Target**: Microsoft Azure  
**Total Development Time**: 10 weeks 