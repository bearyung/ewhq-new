# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EWHQ is a comprehensive Enterprise POS (Point of Sale) system with:
- **.NET 9.0** ASP.NET Core Web API backend
- **React 18/19** TypeScript frontends:
  - **HQ Portal** (frontend-hq-portal): Customer-facing portal for managing POS settings, menus, reports
  - **Internal Admin** (frontend-internal-admin): Internal staff portal for account and team management
- **Multi-tenancy** with separate databases for Identity, Admin, and POS data
- **Multi-database support** (SQL Server and PostgreSQL)
- **Auth0 authentication** with JWT tokens and role-based access control

## Common Development Commands

### Backend Development
```bash
# Navigate to API directory
cd backend/EWHQ.Api

# Run the API server
dotnet run

# Build the project
dotnet build

# Run with specific environment
dotnet run --environment Development

# Run database migrations
dotnet ef database update --context ApplicationDbContext
dotnet ef database update --context AdminDbContext
dotnet ef database update --context AdminPortalDbContext
dotnet ef database update --context EWHQDbContext

# Create new migration
dotnet ef migrations add MigrationName --context AdminPortalDbContext
```

### Frontend Development
```bash
# HQ Portal (Customer-facing application)
cd frontend-hq-portal
npm install
npm run dev      # Start development server on port 5173
npm run build    # Production build
npm run lint     # Run ESLint

# Internal Admin Portal (Staff application)
cd frontend-internal-admin
npm install
npm run dev      # Start development server on port 5174
npm run build    # Production build
npm run lint     # Run ESLint
```

### Full Stack Development
```bash
# From root directory - starts both backend and frontend-internal-admin
./start-dev.sh
```

### Testing
```bash
# Test authentication endpoints
cd backend/EWHQ.Api
./test-auth.sh

# Run Playwright tests (from root)
npm test
```

## Architecture Overview

### Backend Structure
The backend follows a layered architecture:

1. **Controllers** (`/Controllers/`): HTTP endpoints organized by feature
   - Auth0Controller: Auth0 authentication integration and user profile sync
   - AuthController: Legacy authentication endpoints (being phased out)
   - CompaniesController, ShopsController: Multi-tenant entity management
   - Extensive POS controllers (Products, Orders, Payments, etc.)

2. **Data Layer** (`/Data/`):
   - **Four separate DbContexts**:
     - `ApplicationDbContext`: Identity and authentication
     - `AdminDbContext`: Admin-specific entities (Teams, TeamMembers, etc.)
     - `AdminPortalDbContext`: Admin portal entities (Company, Brand)
     - `EWHQDbContext`: EWHQ Portal POS entities (AccountMaster, Shop, and POS operations)
   - **Multi-database support**: Configured via `DatabaseProvider` in appsettings

3. **Services** (`/Services/`):
   - Business logic layer between controllers and data
   - Key services: CompanyService, TeamService, EmailService
   - Uses dependency injection throughout

4. **Models**:
   - `/Data/Models/`: Over 150 POS entity models
   - `/DTOs/`: Data transfer objects for API communication
   - Comprehensive coverage of POS operations (inventory, sales, customers, etc.)

### Frontend Architecture
Both frontend applications share similar structure:

1. **Component-based** React with TypeScript
2. **Protected routing** with Auth0Context
3. **Service layer** (`/services/`) for API communication
4. **Tailwind CSS** for styling
5. **Vite** for build tooling

### Key Architectural Patterns

1. **Multi-Tenancy**:
   - Companies and Shops form the tenant hierarchy
   - Data isolation at the database level
   - Team-based access control for back-office management

2. **Authentication Flow**:
   - Auth0 authentication with JWT Bearer tokens
   - User profile synchronization between Auth0 and local database
   - Role-based authorization (SuperAdmin, Admin, Manager, Employee, Standard)
   - Protected API endpoints and frontend routes using Auth0

3. **Database Strategy**:
   - Separate contexts for different concerns
   - Migration support for both SQL Server and PostgreSQL
   - Connection strings in appsettings with .env override support

## Environment Configuration

### Backend (.env file in EWHQ.Api):
```
ConnectionStrings__DefaultConnection=your_connection_string
ConnectionStrings__IdentityConnection=your_identity_connection
ConnectionStrings__AdminConnection=your_admin_connection
SendGrid__ApiKey=your_sendgrid_key
Auth0__Domain=your_auth0_domain
Auth0__Audience=your_auth0_audience
Auth0__ClientId=your_auth0_client_id
Auth0__ClientSecret=your_auth0_client_secret
```

### Frontend (.env files):
```
VITE_API_URL=http://localhost:5000
VITE_AUTH0_DOMAIN=your_auth0_domain
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_AUTH0_AUDIENCE=your_auth0_audience
VITE_AUTH0_REDIRECT_URI=http://localhost:5173/callback (or 5174 for internal admin)
```

## Important Notes

- Always check the specific DbContext when working with database operations
- Use the appropriate connection string for each context
- Frontend applications run on different ports:
  - Port 5173: HQ Portal (customer-facing)
  - Port 5174: Internal Admin Portal (staff-facing)
- Auth0 tokens are cached in localStorage and included in API requests as Bearer tokens
- The system supports both SQL Server and PostgreSQL - check `DatabaseProvider` setting
- **Frontend Testing**: Unless specifically requested otherwise, always use Playwright MCP (NOT Chrome DevTools MCP) to test frontend functionality when needed
