# EWHQ Admin Portal Implementation Plan

## Overview
The EWHQ Admin Portal is a comprehensive management system for administrators and team members. The system uses a **hierarchical permission model** with team-based access control, allowing different levels of access based on user roles.

## Permission Hierarchy

### 1. **Team Member** (Standard User)
- Can view/create/edit/delete their own Companies, Brands, and Shops
- Cannot access team management features
- Sees only "Dashboard" and "Client Management" in navigation

### 2. **Team Leader**
- Inherits all Team Member permissions
- Can view and manage members in their team (invite/remove/change roles)
- Can access "Teams" section to view their team
- Cannot create, edit, or delete teams
- Sees "Teams & Users" → "Teams" in navigation

### 3. **Admin** (Distributor/Reseller)
- Inherits all Team Leader permissions
- Can create new teams
- Can edit and delete teams they created
- Can view all users in the system
- Sees full "Teams & Users" section (Teams, All Users, Invitations)

### 4. **Super Admin**
- Full system access
- Can view and manage ALL teams, users, companies, brands, and shops
- No restrictions on any operations

## Implementation Status

### ✅ Phase 1: Core Infrastructure (Completed)
- [x] Three-database architecture (POS, Identity, Admin)
- [x] JWT-based authentication with Bearer tokens
- [x] User profile management with password change
- [x] Basic admin portal structure with React + TypeScript
- [x] API integration with backend services

### ✅ Phase 2: Team Management System (Completed)
- [x] Team and TeamMember entities in Admin database
- [x] Team CRUD operations (create, read, update, delete)
- [x] Team member management (invite, remove, change roles)
- [x] Email invitation system with SendGrid integration
- [x] Invitation acceptance flow with token validation
- [x] Team-based visibility rules for companies

### ✅ Phase 3: Role-Based Access Control (Completed)
- [x] Frontend authorization with RoleProtectedRoute component
- [x] Enhanced AuthContext with role checking methods
- [x] Dynamic navigation based on user permissions
- [x] Backend authorization with User.IsInRole checks
- [x] API endpoint for fetching user team memberships
- [x] Permission-based UI element visibility

### ✅ Phase 4: Permission Hierarchy Implementation (Completed)
- [x] Team Leaders can only see their team's data
- [x] Admins can create/edit/delete teams
- [x] Super Admins have unrestricted access
- [x] Proper menu filtering based on roles
- [x] Action button visibility based on permissions

### 📋 Phase 5: User Management (In Progress)
- [x] All Users page with search and filtering ✅
- [x] Backend API for user listing with pagination ✅ 
- [x] User search and filtering functionality ✅
- [x] User status indicators and role badges ✅
- [x] CSV export functionality ✅
- [x] User profile editing for admins ✅
- [ ] User creation page
- [ ] CSV import functionality
- [ ] User activity logs and audit trails
- [x] Team assignment during user creation ✅

### 🔮 Phase 6: Advanced Features (Planned)
- [ ] Analytics dashboard with team performance metrics
- [ ] Advanced search across all entities
- [ ] Notification system for team activities
- [ ] Multi-language support
- [ ] Mobile-responsive design improvements
- [ ] Real-time collaboration features

## Current Navigation Structure

```
Dashboard (All users)
├── Teams & Users (Admin/Team Leader only)
│   ├── Teams 
│   │   └── Team Leader: Can view their team only
│   │   └── Admin: Can view/create all teams
│   ├── All Users (Admin only)
│   └── Invitations (Admin only)
├── Client Management (All users)
│   ├── Companies
│   ├── Brands
│   └── Shops
└── Your Profile (All users)
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Profile
- `GET /api/profile` - Get current user profile ✅
- `GET /api/profile/teams` - Get user's team memberships ✅

### Teams
- `GET /api/teams` - List teams (filtered by permissions)
- `POST /api/teams` - Create new team (Admin only)
- `GET /api/teams/{id}` - Get team details
- `PUT /api/teams/{id}` - Update team (Admin only)
- `DELETE /api/teams/{id}` - Delete team (Admin only)
- `GET /api/teams/{id}/members` - Get team members
- `POST /api/teams/{id}/invite` - Invite member to team
- `PUT /api/teams/{id}/members/{userId}/role` - Update member role
- `DELETE /api/teams/{id}/members/{userId}` - Remove member

### Invitations
- `GET /api/teams/invitations/validate` - Validate invitation token
- `POST /api/teams/invitations/accept` - Accept invitation

### Users
- `GET /api/users` - List users with pagination and filtering (Admin only) ✅
- `GET /api/users/{id}` - Get user details (Admin only) ✅
- `PUT /api/users/{id}` - Update user (Admin only) ✅
- `DELETE /api/users/{id}` - Delete user (SuperAdmin only) ✅
- `POST /api/users/{id}/activate` - Activate user (Admin only) ✅
- `POST /api/users/{id}/deactivate` - Deactivate user (Admin only) ✅
- `POST /api/users/{id}/reset-password` - Reset user password (SuperAdmin only) ✅
- `GET /api/users/export` - Export users to CSV (Admin only) ✅

### Companies
- `GET /api/companies` - List companies (filtered by team/user)
- `POST /api/companies` - Create company
- `GET /api/companies/{id}` - Get company details
- `PUT /api/companies/{id}` - Update company
- `DELETE /api/companies/{id}` - Delete company

## Technical Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with HeadlessUI
- **HTTP Client**: Axios with interceptors
- **Build Tool**: Vite

### Backend
- **Framework**: ASP.NET Core 6.0
- **Authentication**: ASP.NET Core Identity with JWT
- **Databases**: 
  - PostgreSQL (via Entity Framework Core)
  - Three separate contexts: POS, Identity, Admin
- **Email Service**: SendGrid
- **API Documentation**: Swagger/OpenAPI

### Security Features
- JWT token-based authentication
- Role-based authorization (RBAC)
- Team-based data isolation
- Secure invitation tokens with expiration
- CORS configuration for frontend access
- Environment-based configuration

## Recent Updates (2025-07-13)

### Authorization System Enhancement
- ✅ Fixed issue where team members could access admin functions
- ✅ Implemented proper permission hierarchy
- ✅ Added ProfileController for user team data
- ✅ Enhanced frontend role checking with `isTeamLeader()` method
- ✅ Updated sidebar to show/hide sections based on permissions

### UI/UX Improvements
- ✅ Team Leaders now see only relevant menu items
- ✅ "Create Team" button hidden from non-admin users
- ✅ "Edit/Delete Team" options restricted to admins
- ✅ Improved loading states for async operations

### User Management Features (Phase 5)
- ✅ Implemented All Users page with DataTable
- ✅ Created UsersController with comprehensive API endpoints
- ✅ Added server-side pagination, search, and filtering
- ✅ Implemented user activation/deactivation using lockout
- ✅ Added CSV export functionality for user data
- ✅ Enhanced Badge component with more color variants
- ✅ Updated userService with all user management methods

## Known Issues & Limitations

1. **Performance**: Team data is fetched separately from auth, causing slight delay
2. **Caching**: No caching implemented for team/user data
3. **Real-time**: No WebSocket support for live updates
4. **Search**: Limited search functionality across entities

## Development Guidelines

### Adding New Features
1. Check user permissions in both frontend and backend
2. Use RoleProtectedRoute for page-level protection
3. Hide UI elements based on user roles/permissions
4. Always validate permissions on the backend
5. Follow the established permission hierarchy

### Testing Checklist
- [ ] Test as Team Member - verify limited access
- [ ] Test as Team Leader - verify team management
- [ ] Test as Admin - verify team creation/editing
- [ ] Test as Super Admin - verify full access
- [ ] Test invitation flow end-to-end
- [ ] Test permission denial scenarios

## CLI Commands

### Backend Development
```bash
# Run backend API
cd backend/EWHQ.Api
dotnet run --urls=http://localhost:5125

# Run migrations
dotnet ef database update -c AdminDbContext
dotnet ef database update -c ApplicationDbContext
dotnet ef database update -c PosDbContext

# Seed sample data
dotnet run seed-teams --force
dotnet run seed-admin --email admin@example.com
```

### Frontend Development
```bash
# Install dependencies
cd frontend-admin
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## Environment Variables

### Backend (.env or appsettings.json)
```
JWT_SECRET=your-secret-key-at-least-32-characters
JWT_ISSUER=EWHQ.Api
JWT_AUDIENCE=EWHQ.Client
JWT_EXPIRY_HOURS=24
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@ewhq.com
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5125/api
```

## Deployment Considerations

1. **Database Migration**: Run all migrations before deployment
2. **Environment Config**: Set production environment variables
3. **CORS Settings**: Update allowed origins for production
4. **SSL/TLS**: Ensure HTTPS is enforced
5. **Monitoring**: Set up application monitoring and logging
6. **Backup Strategy**: Implement database backup procedures

---

**Last Updated**: 2025-07-13  
**Version**: 2.0.0  
**Status**: Core features complete, user management in progress