# Multi-Tenancy Architecture

## Overview

The EWHQ system now supports proper multi-tenancy with a flexible user access model. Users can have different roles and access to multiple accounts and shops.

## User Types

### 1. **SuperAdmin**
- System-wide administrator
- Can access all accounts and shops
- Manages resellers and distributors
- No specific AccountId or ShopId

### 2. **Admin**
- Company-level administrator
- Manages their own company's accounts and shops
- Has UserTenant relationships to specific accounts

### 3. **Reseller**
- Partner who resells the POS system
- Can manage multiple client accounts
- Has company information (CompanyName, CompanyRegistrationNumber)
- UserTenant relationships define which accounts they can access

### 4. **Distributor**
- Similar to reseller but with limited permissions
- Read-only access to assigned accounts
- Has company information

### 5. **Standard**
- Regular POS users (cashiers, managers)
- Belong to specific accounts/shops via UserTenant

## Database Schema

### ApplicationUser
```csharp
public class ApplicationUser : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string UserType { get; set; } = "Standard";
    public string? CompanyName { get; set; }
    public string? CompanyRegistrationNumber { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public ICollection<UserTenant> UserTenants { get; set; }
}
```

### UserTenant
```csharp
public class UserTenant
{
    public string Id { get; set; }
    public string UserId { get; set; }
    public ApplicationUser User { get; set; }
    public int AccountId { get; set; }
    public int? ShopId { get; set; } // Null = access to all shops
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; }
    public string? Role { get; set; } // Role within tenant
    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}
```

## Access Control Logic

### SuperAdmin
- No UserTenant records needed
- Check: `user.UserType == "SuperAdmin"` OR `roles.Contains("SuperAdmin")`
- Can access everything

### Reseller/Distributor
- UserTenant records define which accounts they can access
- Example: Reseller A has UserTenant records for Account 1, 2, 3
- Can only see/manage those specific accounts

### Standard Users
- Usually have one UserTenant record
- Defines their primary account and shop
- ShopId can be null for account-level access

## Implementation Examples

### 1. Check if user can access an account
```csharp
public bool CanAccessAccount(ApplicationUser user, int accountId)
{
    // SuperAdmin can access everything
    if (user.UserType == "SuperAdmin") return true;
    
    // Check UserTenant relationships
    return user.UserTenants.Any(ut => 
        ut.AccountId == accountId && 
        ut.IsActive);
}
```

### 2. Get user's accessible accounts
```csharp
public async Task<List<int>> GetAccessibleAccounts(ApplicationUser user)
{
    // SuperAdmin gets all accounts
    if (user.UserType == "SuperAdmin")
    {
        return await _context.AccountMasters
            .Select(a => a.AccountId)
            .ToListAsync();
    }
    
    // Others get their assigned accounts
    return await _context.UserTenants
        .Where(ut => ut.UserId == user.Id && ut.IsActive)
        .Select(ut => ut.AccountId)
        .Distinct()
        .ToListAsync();
}
```

### 3. JWT Claims
```csharp
// For SuperAdmin
claims.Add(new Claim("UserType", "SuperAdmin"));
// No specific AccountId/ShopId claims

// For others with default tenant
var defaultTenant = user.UserTenants
    .FirstOrDefault(ut => ut.IsDefault && ut.IsActive);
if (defaultTenant != null)
{
    claims.Add(new Claim("DefaultAccountId", defaultTenant.AccountId.ToString()));
    if (defaultTenant.ShopId.HasValue)
        claims.Add(new Claim("DefaultShopId", defaultTenant.ShopId.Value.ToString()));
}
```

## Migration Path

### From Old Model (AccountId/ShopId in User)
1. Create UserTenant records for existing users
2. Map User.AccountId/ShopId to UserTenant
3. Set IsDefault = true for migrated records
4. Remove AccountId/ShopId from ApplicationUser

### SQL Migration Example
```sql
-- Migrate existing users to UserTenant
INSERT INTO "Identity"."UserTenants" 
    ("Id", "UserId", "AccountId", "ShopId", "IsDefault", "IsActive", "CreatedAt")
SELECT 
    gen_random_uuid()::text,
    u."Id",
    u."AccountId",
    u."ShopId",
    true,
    true,
    CURRENT_TIMESTAMP
FROM "Identity"."Users" u
WHERE u."AccountId" IS NOT NULL;
```

## Benefits

1. **Flexibility**: Users can access multiple accounts/shops
2. **Scalability**: Easy to add/remove access
3. **Security**: Clear access boundaries
4. **Audit Trail**: Track who granted access and when
5. **Role Granularity**: Different roles per tenant

## Frontend Implementation

### Admin Portal
- SuperAdmin sees all companies/brands/shops
- Resellers see only assigned accounts
- Filter data based on user's accessible accounts

### POS Application
- Standard users login with default tenant
- Can switch between accessible shops
- UI adapts based on user's permissions