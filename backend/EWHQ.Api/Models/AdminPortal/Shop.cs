namespace EWHQ.Api.Models.AdminPortal;

/// <summary>
/// Simplified Shop model for Admin Portal (onboarding and management)
/// This is separate from the legacy EWHQ POS Shop model
/// </summary>
public class Shop
{
    public int Id { get; set; }
    public int BrandId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Address information
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    // Contact information
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? ContactName { get; set; }
    public string? ContactTitle { get; set; }

    // Business information
    public string? TimeZone { get; set; }
    public string? Currency { get; set; }
    public string? CurrencySymbol { get; set; }
    public string? BusinessRegistrationNumber { get; set; }
    public string? TaxId { get; set; }

    // Shop settings
    public string? ShopType { get; set; } // Restaurant, Retail, Service, etc.
    public string? OpeningHours { get; set; } // JSON string for complex hours
    public bool IsOnlineOrderingEnabled { get; set; } = false;
    public bool IsDeliveryEnabled { get; set; } = false;
    public bool IsPickupEnabled { get; set; } = false;

    // Integration keys (to link with legacy EWHQ system if needed)
    public int? LegacyShopId { get; set; }
    public int? LegacyAccountId { get; set; }

    // Status and metadata
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty; // User ID who created
    public string? UpdatedBy { get; set; } // User ID who last updated

    // Navigation properties
    public virtual Brand Brand { get; set; } = null!;
    public virtual ICollection<UserShop> UserShops { get; set; } = new List<UserShop>();
}