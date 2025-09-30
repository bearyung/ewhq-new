# Admin Account Creation Strategy

## Overview
This document outlines the strategy for creating and managing admin accounts in the EWHQ system.

## Account Hierarchy
1. **Super Admin** - System-level access, created via backend tools
2. **Admin** - Company-level admin, created by Super Admin
3. **Reseller** - Partner account, created by Super Admin/Admin
4. **Distributor** - Limited partner account, created by Admin/Reseller

## Initial Setup Methods

### Method 1: Database Seed (Development/Staging)
```bash
# In backend project
dotnet ef database update
dotnet run seed-admin --email admin@ewhq.com --password TempPass123!
```

### Method 2: CLI Tool (Production)
```bash
# Dedicated CLI tool
ewhq-cli create-admin \
  --email admin@company.com \
  --first-name "System" \
  --last-name "Administrator" \
  --role super_admin
```

### Method 3: Environment-Based (Docker/Kubernetes)
```yaml
environment:
  - EWHQ_INIT_ADMIN_EMAIL=admin@ewhq.com
  - EWHQ_INIT_ADMIN_PASSWORD_HASH=$2b$10$... # BCrypt hash
  - EWHQ_INIT_ADMIN_FORCE_PASSWORD_CHANGE=true
```

## Security Considerations

1. **No Default Credentials**
   - Never hardcode passwords
   - Generate secure passwords during setup
   - Force password change on first login

2. **Setup Token**
   - Require a one-time setup token for first-run wizard
   - Token expires after use or timeout

3. **Audit Trail**
   - Log all admin account creations
   - Track who created which accounts

4. **MFA Requirement**
   - Enforce MFA for all admin accounts
   - Especially for super_admin roles

## Implementation Priority

### Phase 1: Backend CLI (Immediate)
- Create a management command in the backend
- Use for initial deployment and emergency access

### Phase 2: First-Run Wizard (Short-term)
- Detect if no super_admin exists
- Show secure setup wizard with token validation
- One-time use only

### Phase 3: Full IAM Integration (Long-term)
- Integrate with enterprise SSO (SAML, OAuth)
- Support for external identity providers
- Automated provisioning/deprovisioning

## Example Backend Implementation

```csharp
// Management command
public class CreateAdminCommand
{
    public async Task Execute(string email, string firstName, string lastName)
    {
        // Check if any super admin exists
        var existingAdmin = await _context.Users
            .AnyAsync(u => u.Role == "super_admin");
        
        if (existingAdmin && !_config.AllowMultipleSuperAdmins)
        {
            throw new InvalidOperationException("Super admin already exists");
        }
        
        // Generate secure temporary password
        var tempPassword = PasswordGenerator.Generate();
        
        // Create user
        var user = new User
        {
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            Role = "super_admin",
            Status = "active",
            MustChangePassword = true,
            CreatedAt = DateTime.UtcNow
        };
        
        // Hash password and save
        user.PasswordHash = _passwordHasher.HashPassword(tempPassword);
        
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
        
        // Log the action
        await _auditLogger.LogAsync("SUPER_ADMIN_CREATED", user.Id);
        
        // Output credentials (only shown once)
        Console.WriteLine($"Super admin created successfully!");
        Console.WriteLine($"Email: {email}");
        Console.WriteLine($"Temporary Password: {tempPassword}");
        Console.WriteLine($"User must change password on first login.");
    }
}
```

## Deployment Checklist

- [ ] Backend CLI tool implemented
- [ ] Database migrations include admin table
- [ ] Password hashing implemented
- [ ] Force password change mechanism
- [ ] Audit logging in place
- [ ] MFA setup available
- [ ] Documentation for DevOps team
- [ ] Emergency access procedures defined