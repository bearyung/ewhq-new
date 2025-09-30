namespace EWHQ.Api.Models.AdminPortal;

/// <summary>
/// Represents the relationship between users and shops with their roles
/// This is for explicit shop-level permissions (overrides inherited from brand/company)
/// </summary>
public class UserShop
{
    public int Id { get; set; }

    // User reference
    public string UserId { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;

    // Shop reference
    public int ShopId { get; set; }

    // Permission level
    public UserRole Role { get; set; }

    // Source of permission
    public PermissionSource Source { get; set; }

    // Additional permissions/restrictions
    public string? CustomPermissions { get; set; }

    // Shop-specific settings
    public bool CanAccessPOS { get; set; } = true;
    public bool CanAccessInventory { get; set; } = true;
    public bool CanAccessReports { get; set; } = true;
    public bool CanProcessRefunds { get; set; } = false;

    // Status
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;

    // Navigation properties
    public virtual Shop Shop { get; set; } = null!;
}