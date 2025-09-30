# Backend-Frontend Integration Guide

## Overview
This guide explains how the backend API (ASP.NET Core) is connected to the frontend admin portal (React).

## Architecture

```
Backend (Port 5125)          Frontend (Port 5173)
ASP.NET Core API      <->    React Admin Portal
  - JWT Auth                   - Axios HTTP Client
  - Identity                   - JWT Token Storage
  - PostgreSQL                 - Protected Routes
```

## Quick Start

### Option 1: Using the start script
```bash
./start-dev.sh
```

### Option 2: Manual start
```bash
# Terminal 1 - Backend
cd backend/EWHQ.Api
dotnet run

# Terminal 2 - Frontend
cd frontend-admin
npm run dev
```

## Configuration

### Backend Configuration
- **URL**: http://localhost:5125
- **API Base**: http://localhost:5125/api
- **CORS**: Configured to allow http://localhost:5173

### Frontend Configuration
- **URL**: http://localhost:5173
- **API URL**: Set in `.env` file as `VITE_API_URL`

## Authentication Flow

1. **Login Request**
   ```typescript
   POST /api/auth/login
   {
     "email": "admin@ewhq.com",
     "password": "your-password"
   }
   ```

2. **Response**
   ```json
   {
     "token": "eyJhbGc...",
     "expiresAt": "2025-01-13T12:00:00Z",
     "email": "admin@ewhq.com",
     "userId": "123",
     "firstName": "System",
     "lastName": "Administrator",
     "roles": ["SuperAdmin"]
   }
   ```

3. **Token Storage**
   - Stored in localStorage
   - Automatically added to all API requests via Axios interceptor

4. **Protected API Calls**
   ```typescript
   // Automatically includes: Authorization: Bearer {token}
   const response = await api.get('/users');
   ```

## Key Integration Points

### 1. API Client (`src/services/api.ts`)
- Axios instance with base URL configuration
- Request interceptor for JWT token
- Response interceptor for 401 handling

### 2. Auth Service (`src/services/authService.ts`)
- Login/logout methods
- Token management
- User session handling

### 3. Auth Context (`src/contexts/AuthContext.tsx`)
- Global authentication state
- User information
- Login/logout methods

### 4. Protected Routes
- Checks authentication before rendering
- Redirects to login if not authenticated

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users (Coming Soon)
- `GET /api/users` - List users
- `GET /api/users/{id}` - Get user details
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Access Control (Coming Soon)
- `GET /api/users/{userId}/access` - Get user access
- `POST /api/users/{userId}/access` - Grant access
- `DELETE /api/users/{userId}/access/{accessId}` - Revoke access

## Security Considerations

1. **JWT Token**
   - Expires after 24 hours (configurable)
   - Contains user claims and roles
   - Stored in localStorage (consider using httpOnly cookies for production)

2. **CORS**
   - Currently allows localhost:5173
   - Update for production domains

3. **HTTPS**
   - Use HTTPS in production
   - Update CORS and cookie settings accordingly

## Troubleshooting

### "Network Error" or CORS Issues
1. Ensure backend is running on port 5125
2. Check CORS configuration in Program.cs
3. Verify frontend .env has correct API URL

### 401 Unauthorized
1. Token may be expired
2. Check if user still exists in database
3. Verify JWT secret matches between restarts

### Cannot Login
1. Ensure database migrations are applied
2. Check if super admin user exists
3. Verify password meets requirements

## Development Tips

1. **Hot Reload**
   - Backend: Uses dotnet watch
   - Frontend: Vite HMR enabled

2. **API Testing**
   - Use Swagger UI at http://localhost:5125/swagger
   - Or use tools like Postman/Insomnia

3. **Debugging**
   - Browser DevTools Network tab
   - Check localStorage for token
   - Backend logs in terminal

## Next Steps

1. Implement user management endpoints
2. Add real-time data fetching
3. Implement access control checks
4. Add error handling and loading states
5. Implement pagination for large datasets