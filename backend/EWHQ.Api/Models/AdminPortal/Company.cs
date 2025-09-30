namespace EWHQ.Api.Models.AdminPortal;

/// <summary>
/// Represents a company/merchant that uses the POS system
/// </summary>
public class Company
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? RegistrationNumber { get; set; }
    public string? TaxId { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    
    // Team association
    public string? TeamId { get; set; } // References Admin.Teams.Id
    public string CreatedByUserId { get; set; } = string.Empty; // References Identity.Users.Id
    
    // Subscription info
    public DateTime? SubscriptionStartDate { get; set; }
    public DateTime? SubscriptionEndDate { get; set; }
    public string? SubscriptionPlan { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Metadata
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public virtual ICollection<Brand> Brands { get; set; } = new List<Brand>();
    public virtual ICollection<UserCompany> UserCompanies { get; set; } = new List<UserCompany>();
}