# User Access Hierarchy Documentation

## Business Structure

```
Company (CompanyId)
  └── Account/Brand (AccountId)
        └── Shop/Outlet (ShopId)
```

## User Access Model

### UserAccess Table Structure
Each record grants access at ONE specific level:
- **Company Level**: User can access all brands and shops under this company
- **Account/Brand Level**: User can access all shops under this brand
- **Shop Level**: User can access only this specific shop

### Example Scenarios

#### Scenario 1: Company Administrator
```sql
-- John is admin for Company A (CompanyId = 1)
INSERT INTO UserAccesses (UserId, CompanyId, Role) 
VALUES ('john-id', 1, 'Admin');
```
Result: John can access all brands and shops under Company A

#### Scenario 2: Brand Manager
```sql
-- Sarah manages Brand X (AccountId = 10) under Company A
INSERT INTO UserAccesses (UserId, AccountId, Role) 
VALUES ('sarah-id', 10, 'Manager');
```
Result: Sarah can access all shops under Brand X only

#### Scenario 3: Shop Operator
```sql
-- Mike operates Shop 101 only
INSERT INTO UserAccesses (UserId, ShopId, Role) 
VALUES ('mike-id', 101, 'Operator');
```
Result: Mike can only access Shop 101

#### Scenario 4: Complex Multi-Role User
```sql
-- Lisa has multiple roles:
-- 1. Admin of Company A
INSERT INTO UserAccesses (UserId, CompanyId, Role) 
VALUES ('lisa-id', 1, 'Admin');

-- 2. Brand Manager of Brand K (AccountId = 20) in Company B
INSERT INTO UserAccesses (UserId, AccountId, Role) 
VALUES ('lisa-id', 20, 'Manager');

-- 3. Shop Viewer of Shop XYZ (ShopId = 500) in Company F
INSERT INTO UserAccesses (UserId, ShopId, Role) 
VALUES ('lisa-id', 500, 'Viewer');
```

## Access Checking Logic

### Can User Access Shop?
```csharp
public async Task<bool> CanAccessShop(string userId, int shopId)
{
    // Check in order of specificity:
    // 1. Direct shop access
    // 2. Account-level access (if shop belongs to that account)
    // 3. Company-level access (if shop belongs to that company)
    // 4. SuperAdmin access
}
```

### Get User's Role for Shop
```csharp
public async Task<string?> GetUserRoleForShop(string userId, int shopId)
{
    // Returns the most specific role:
    // If user has shop-level access, return that role
    // Else if user has account-level access, return that role
    // Else if user has company-level access, return that role
    // Else return null
}
```

## Role Types

### Admin
- Full control at their access level
- Can create/update/delete
- Can manage users at lower levels

### Manager
- Operational control
- Can manage daily operations
- Cannot change critical settings

### Operator
- Day-to-day operations
- Limited to assigned functions
- No user management

### Viewer
- Read-only access
- Reporting and monitoring
- No modifications allowed

## Implementation Examples

### 1. API Authorization
```csharp
[HttpGet("shops/{shopId}")]
[Authorize]
public async Task<IActionResult> GetShop(int shopId)
{
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    
    if (!await _accessService.CanAccessShopAsync(userId, shopId))
        return Forbid();
        
    var userAccess = await _accessService.GetUserAccessForShopAsync(userId, shopId);
    
    // Use userAccess.Role to determine what data to show
    var shop = await _shopService.GetShopAsync(shopId, userAccess.Role);
    
    return Ok(shop);
}
```

### 2. Frontend Menu Generation
```typescript
// Get all accessible entities for user
const companies = await getAccessibleCompanies();
const accounts = await getAccessibleAccounts();
const shops = await getAccessibleShops();

// Build hierarchical menu
const menu = companies.map(company => ({
  id: company.id,
  name: company.name,
  type: 'company',
  children: accounts
    .filter(acc => acc.companyId === company.id)
    .map(account => ({
      id: account.id,
      name: account.name,
      type: 'account',
      children: shops
        .filter(shop => shop.accountId === account.id)
        .map(shop => ({
          id: shop.id,
          name: shop.name,
          type: 'shop'
        }))
    }))
}));
```

### 3. JWT Claims
```csharp
// Don't put specific access in JWT - too complex and changeable
// Instead, put user type and fetch access dynamically
claims.Add(new Claim("UserType", user.UserType));
claims.Add(new Claim("UserId", user.Id));

// On each request, check access from database
// This allows real-time permission changes
```

## Benefits

1. **Flexible**: Users can have different roles at different levels
2. **Scalable**: Easy to add new companies/brands/shops
3. **Granular**: Precise control over who can access what
4. **Auditable**: Clear record of access grants
5. **Real-time**: Permissions take effect immediately

## Migration from Old System

If migrating from a system where users had direct AccountId/ShopId:

```sql
-- Migrate users with AccountId (brand-level access)
INSERT INTO UserAccesses (UserId, AccountId, Role, CreatedAt)
SELECT Id, AccountId, 'Admin', CURRENT_TIMESTAMP
FROM Users 
WHERE AccountId IS NOT NULL AND ShopId IS NULL;

-- Migrate users with ShopId (shop-level access)
INSERT INTO UserAccesses (UserId, ShopId, Role, CreatedAt)
SELECT Id, ShopId, 'Operator', CURRENT_TIMESTAMP
FROM Users 
WHERE ShopId IS NOT NULL;
```