namespace EWHQ.Api.Models.AdminPortal;

/// <summary>
/// Represents a team of admin users who work together
/// </summary>
public class Team
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    
    // Navigation properties
    public virtual ICollection<TeamMember> TeamMembers { get; set; } = new List<TeamMember>();
}