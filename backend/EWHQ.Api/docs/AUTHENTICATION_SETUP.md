# ASP.NET Core Identity Authentication Setup Guide

This document outlines the steps to complete the authentication setup for the EWHQ backend.

## Prerequisites

- .NET 9.0 SDK installed
- SQL Server database (Azure SQL or local)
- Entity Framework Core CLI tools (`dotnet tool install --global dotnet-ef`)

## Setup Steps

### 1. Configure Environment Variables

Create a `.env` file in the backend root directory (`/backend/EWHQ.Api/`) based on `.env.example`:

```env
# Main Database Configuration
DB_SERVER=your-server.database.windows.net
DB_NAME=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password

# Identity Database Configuration (can be same as main DB or separate)
IDENTITY_DB_SERVER=your-server.database.windows.net
IDENTITY_DB_NAME=your-identity-database-name
IDENTITY_DB_USER=your-username
IDENTITY_DB_PASSWORD=your-password

# JWT Configuration
JWT_SECRET=your-very-long-secret-key-at-least-32-characters-long
JWT_ISSUER=EWHQ.Api
JWT_AUDIENCE=EWHQ.Client
JWT_EXPIRY_HOURS=24
```

**Important Notes:**
- The JWT_SECRET should be at least 32 characters long and kept secure
- You can use the same database for both main data and Identity, or separate them
- Never commit the `.env` file to source control

### 2. Run Database Migrations

Open a terminal in the `/backend/EWHQ.Api/` directory and run:

```bash
# Create Identity migration
dotnet ef migrations add InitialIdentity -c ApplicationDbContext

# Apply the migration to create Identity tables
dotnet ef database update -c ApplicationDbContext
```

This will create the following tables in your database:
- `Identity.Users` - User accounts
- `Identity.Roles` - User roles
- `Identity.UserRoles` - User-role mappings
- `Identity.UserClaims` - User claims
- `Identity.UserLogins` - External login providers
- `Identity.RoleClaims` - Role claims
- `Identity.UserTokens` - User tokens

### 3. Test Authentication Endpoints

The following endpoints are available for authentication:

#### Register a new user
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "accountId": 1,
  "shopId": 1
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

Both endpoints return a JWT token in the response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2024-06-28T12:00:00Z",
  "email": "user@example.com",
  "userId": "guid-here",
  "firstName": "John",
  "lastName": "Doe",
  "accountId": 1,
  "shopId": 1
}
```

### 4. Using the JWT Token

Include the JWT token in the Authorization header for protected endpoints:

```http
GET /api/shops/account/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 5. Password Requirements

The current password policy requires:
- Minimum 6 characters
- At least one digit
- At least one uppercase letter
- At least one lowercase letter
- Non-alphanumeric characters are NOT required

### 6. Protected Endpoints

The following controllers/endpoints are protected and require authentication:
- `/api/shops/*` - All shop-related endpoints

The following endpoints are public:
- `/api/helloworld` - Health check endpoint
- `/api/auth/register` - User registration
- `/api/auth/login` - User login

### 7. Customizing Authentication

You can modify the following files to customize authentication:
- `/Identity/ApplicationUser.cs` - Add custom user properties
- `/Identity/ApplicationDbContext.cs` - Modify Identity table configurations
- `/Controllers/AuthController.cs` - Customize authentication logic
- `Program.cs` - Modify Identity options, password policies, JWT settings

### 8. Security Considerations

1. **JWT Secret**: Always use a strong, unique secret key in production
2. **HTTPS**: Always use HTTPS in production to protect tokens in transit
3. **Token Expiry**: Consider shorter expiry times for production (e.g., 1-2 hours)
4. **Refresh Tokens**: Consider implementing refresh tokens for better security
5. **Account Lockout**: The system locks accounts after 5 failed login attempts for 5 minutes

### 9. Troubleshooting

**Common Issues:**

1. **Migration fails**: Ensure your connection string in `.env` is correct
2. **Login returns 401**: Check that the email and password are correct
3. **Protected endpoints return 401**: Ensure you're including the Bearer token in the Authorization header
4. **Token validation fails**: Verify that JWT_SECRET, JWT_ISSUER, and JWT_AUDIENCE match between token generation and validation

### 10. Next Steps

After completing the setup:
1. Consider implementing role-based authorization
2. Add refresh token functionality
3. Implement password reset functionality
4. Add two-factor authentication
5. Integrate with external authentication providers (Google, Microsoft, etc.)