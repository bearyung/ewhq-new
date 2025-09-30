namespace EWHQ.Api.Models.AdminPortal;

/// <summary>
/// Represents the relationship between users and brands with their roles
/// This is for explicit brand-level permissions (overrides inherited from company)
/// </summary>
public class UserBrand
{
    public int Id { get; set; }

    // User reference
    public string UserId { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;

    // Brand reference
    public int BrandId { get; set; }

    // Permission level
    public UserRole Role { get; set; }

    // Source of permission
    public PermissionSource Source { get; set; }

    // Additional permissions/restrictions
    public string? CustomPermissions { get; set; }

    // Status
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty; // User who granted permission

    // Navigation properties
    public virtual Brand Brand { get; set; } = null!;
}

/// <summary>
/// Indicates how the user got this permission
/// </summary>
public enum PermissionSource
{
    Direct = 1,      // Explicitly assigned to this brand
    Inherited = 2    // Inherited from company ownership
}