namespace EWHQ.Api.Identity;

/// <summary>
/// User entity for Auth0 integration.
/// Authentication is handled by Auth0, this entity stores user profile and basic information.
/// </summary>
public class ApplicationUser
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    // Basic profile information
    public string? Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PhoneNumber { get; set; }

    // Auth0 integration
    public string? Auth0UserId { get; set; } // Auth0 user identifier (e.g., "auth0|xxx" or "google-oauth2|xxx")
    public string? IdentityProvider { get; set; } // Identity provider (e.g., "auth0", "google-oauth2", "facebook", etc.)

    // User type to distinguish between different user categories
    public string UserType { get; set; } = "Standard"; // SuperAdmin, Admin, Standard

    // Company information (if applicable)
    public string? CompanyName { get; set; }
    public string? CompanyRegistrationNumber { get; set; }

    // Audit fields
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}