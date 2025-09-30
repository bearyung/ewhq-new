using EWHQ.Api.Models.AdminPortal;
using EWHQ.Api.Models.DTOs;

namespace EWHQ.Api.Services;

public interface ITeamService
{
    // Team operations
    Task<IEnumerable<Team>> GetAllTeamsAsync();
    Task<IEnumerable<Team>> GetUserTeamsAsync(string userId);
    Task<Team?> GetTeamByIdAsync(string id);
    Task<Team> CreateTeamAsync(Team team, string createdByUserId);
    Task<Team?> UpdateTeamAsync(string id, Team team);
    Task<bool> DeleteTeamAsync(string id);

    // Team member operations
    Task<IEnumerable<TeamMemberDto>> GetTeamMembersAsync(string teamId);
    Task<TeamMember?> GetTeamMemberAsync(string teamId, string userId);
    Task<bool> AddTeamMemberAsync(string teamId, string userId, TeamRole role, string invitedByUserId);
    Task<TeamInvitation?> InviteTeamMemberByEmailAsync(string teamId, string email, TeamRole role, string invitedByUserId);
    Task<(bool success, string? userId)> AcceptInvitationAsync(string token, string email, string firstName, string lastName, string password);
    Task<bool> ResendInvitationAsync(string invitationId);
    Task<bool> UpdateTeamMemberRoleAsync(string teamId, string userId, TeamRole newRole);
    Task<bool> RemoveTeamMemberAsync(string teamId, string userId);
    
    // Team invitation operations
    Task<IEnumerable<TeamInvitation>> GetPendingInvitationsAsync(string teamId);
    Task<bool> CancelInvitationAsync(string invitationId);
    
    // Permission checks
    Task<bool> IsUserTeamLeaderAsync(string teamId, string userId);
    Task<bool> IsUserInTeamAsync(string teamId, string userId);
    Task<TeamRole?> GetUserRoleInTeamAsync(string teamId, string userId);
}