# Complete Hierarchy Structure

## Overview

EWHQ implements a sophisticated multi-tenancy system with two parallel hierarchies that work together to provide flexible access control.

## 1. Back Office Admin Hierarchy

This hierarchy controls who can manage and support the EWHQ system itself.

```
Super Admin (System-wide control)
    ├── Distributor (Regional control)
    │   └── Reseller (Client management)
    └── Direct Resellers (Without distributor)
```

### Roles Explained:

#### Super Admin
- **Scope**: Entire EWHQ system
- **Capabilities**: 
  - Create/manage distributors and resellers
  - Access all system features
  - View all companies, brands, and shops
  - System configuration and maintenance
- **Example**: EWHQ system administrators

#### Distributor
- **Scope**: Specific region or territory
- **Capabilities**:
  - Manage resellers in their region
  - View all clients under their resellers
  - Regional reporting and analytics
  - Cannot create other distributors
- **Example**: "North America Distributor", "APAC Distributor"

#### Reseller
- **Scope**: Specific clients/companies
- **Capabilities**:
  - Onboard new companies
  - Manage assigned companies
  - Provide first-level support
  - Cannot create distributors or other resellers
- **Example**: "NYC POS Solutions", "London Tech Partners"

## 2. Client Business Hierarchy

This hierarchy represents the actual business structure of clients using the POS system.

```
Company (Business entity)
    ├── Account/Brand (Business divisions)
    │   └── Shop (Physical locations)
    └── Account/Brand
        └── Shop
```

### Entities Explained:

#### Company
- **Definition**: Top-level business entity
- **Examples**: "Pizza Chain Inc.", "Global Coffee Ltd."
- **Contains**: Multiple brands/accounts

#### Account/Brand
- **Definition**: Different brands or divisions under a company
- **Examples**: "Pizza Express", "Burger Palace" (under Pizza Chain Inc.)
- **Contains**: Multiple shop locations

#### Shop
- **Definition**: Individual physical locations or outlets
- **Examples**: "Pizza Express - Downtown", "Pizza Express - Airport"
- **Operates**: Actual POS terminals

## 3. Multiple Role Scenarios

A single user can have different roles across both hierarchies:

### Example 1: John Smith
```
John Smith
├── Distributor for "North America" (Back Office)
├── Reseller for "Europe/UK" (Back Office - under different distributor)
├── Company Admin for "Pizza Chain Inc." (Client)
└── Shop Manager for "Coffee World - Station" (Client)
```

### Example 2: Mary Johnson
```
Mary Johnson
├── Reseller for "East Coast Clients" (Back Office)
├── Account Admin for "Burger Palace" (Client)
└── Shop Manager for "Pizza Express - Mall" (Client)
```

## 4. Access Control Matrix

| User Role | Can Access | Cannot Access |
|-----------|------------|---------------|
| Super Admin | Everything | Nothing (full access) |
| Distributor (Region A) | All resellers in Region A<br>All companies under those resellers | Other regions<br>Direct system configuration |
| Reseller | Assigned companies only<br>All brands/shops under those companies | Other resellers' clients<br>Distributor functions |
| Company Admin | All brands under their company<br>All shops under those brands | Other companies<br>Back office functions |
| Brand Admin | Specific brand<br>All shops under that brand | Other brands<br>Company-level settings |
| Shop Manager | Specific shop only | Other shops<br>Brand-level settings |

## 5. UserAccess Model Implementation

The `UserAccess` table supports this complex hierarchy:

```csharp
public class UserAccess
{
    public string Id { get; set; }
    public string UserId { get; set; }
    public ApplicationUser User { get; set; }
    
    // Back Office Access
    public string? DistributorId { get; set; }  // If user is distributor
    public string? ResellerId { get; set; }     // If user is reseller
    public string? RegionCode { get; set; }     // Region for distributor
    
    // Client Business Access
    public int? CompanyId { get; set; }         // Access to company
    public int? AccountId { get; set; }         // Access to brand/account
    public int? ShopId { get; set; }            // Access to specific shop
    
    // Role at this level
    public string Role { get; set; }            // Admin, Manager, User, etc.
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }    // For temporary access
}
```

## 6. Practical Examples

### Creating a Distributor
```csharp
// John becomes North America Distributor
new UserAccess {
    UserId = "john-id",
    DistributorId = "dist-na-001",
    RegionCode = "NA",
    Role = "Distributor",
    IsActive = true
}
```

### Distributor Also Becomes Reseller
```csharp
// John also becomes reseller under Europe Distributor
new UserAccess {
    UserId = "john-id",
    DistributorId = "dist-eu-001",  // Different distributor
    ResellerId = "reseller-uk-001",
    RegionCode = "EU-UK",
    Role = "Reseller",
    IsActive = true
}
```

### Reseller Managing Client
```csharp
// John manages Pizza Chain Inc.
new UserAccess {
    UserId = "john-id",
    CompanyId = 1,  // Pizza Chain Inc.
    Role = "CompanyAdmin",
    IsActive = true
}
```

### User as Shop Manager
```csharp
// John manages specific shop
new UserAccess {
    UserId = "john-id",
    CompanyId = 2,      // Coffee World Ltd.
    AccountId = 3,      // Coffee World brand
    ShopId = 6,         // Station location
    Role = "ShopManager",
    IsActive = true
}
```

## 7. Query Examples

### Get all companies a user can access:
```csharp
var accessibleCompanies = await _context.UserAccess
    .Where(ua => ua.UserId == userId && ua.IsActive)
    .Where(ua => ua.CompanyId.HasValue)
    .Select(ua => ua.CompanyId.Value)
    .Distinct()
    .ToListAsync();
```

### Check if user is distributor:
```csharp
var isDistributor = await _context.UserAccess
    .AnyAsync(ua => 
        ua.UserId == userId && 
        ua.DistributorId != null && 
        ua.Role == "Distributor" && 
        ua.IsActive);
```

### Get all resellers under a distributor:
```csharp
var resellers = await _context.UserAccess
    .Where(ua => 
        ua.DistributorId == distributorId && 
        ua.Role == "Reseller" && 
        ua.IsActive)
    .Select(ua => new { ua.UserId, ua.ResellerId })
    .Distinct()
    .ToListAsync();
```

## 8. Security Considerations

1. **Access Validation**: Always validate access at the lowest required level
2. **Role Precedence**: Higher roles don't automatically grant lower role access
3. **Explicit Access**: Each access level must be explicitly granted
4. **Audit Trail**: Track all access grants/revokes with timestamps and who made the change
5. **Expiring Access**: Support temporary access with ExpiresAt field

## 9. Frontend Implementation

The admin portal should adapt based on user's roles:

1. **Navigation Menu**: Show only accessible sections
2. **Data Filtering**: Filter lists based on user's access
3. **Role Switching**: Allow users to switch between their different roles
4. **Context Display**: Show current role/context in UI

Example UI adaptation:
```javascript
// Show distributor menu if user has distributor access
if (userAccess.some(ua => ua.role === 'Distributor')) {
    showDistributorMenu();
}

// Show reseller functions if user has reseller access
if (userAccess.some(ua => ua.role === 'Reseller')) {
    showResellerFunctions();
}

// Show company management if user has company access
if (userAccess.some(ua => ua.companyId)) {
    showCompanyManagement();
}
```