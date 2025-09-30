namespace EWHQ.Api.Models.AdminPortal;

/// <summary>
/// Represents a brand/account under a company
/// </summary>
public class Brand
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Legacy POS Integration fields
    public int? LegacyAccountId { get; set; }
    public bool UseLegacyPOS { get; set; } = false;

    // Navigation properties
    public virtual Company Company { get; set; } = null!;
    public virtual ICollection<Shop> Shops { get; set; } = new List<Shop>();
    public virtual ICollection<UserBrand> UserBrands { get; set; } = new List<UserBrand>();
}