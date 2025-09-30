using EWHQ.Api.Models.AdminPortal;

namespace EWHQ.Api.Models.DTOs;

public class TeamMemberDto
{
    public string TeamId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string UserFirstName { get; set; } = string.Empty;
    public string UserLastName { get; set; } = string.Empty;
    public TeamRole Role { get; set; }
    public DateTime JoinedAt { get; set; }
    public string? InvitedByUserId { get; set; }
    public bool IsActive { get; set; }
}