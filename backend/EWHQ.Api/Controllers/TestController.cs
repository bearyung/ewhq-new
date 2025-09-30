using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EWHQ.Api.Data;
using EWHQ.Api.Services;

namespace EWHQ.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    private readonly AdminDbContext _context;

    public TestController(AdminDbContext context)
    {
        _context = context;
    }

    [HttpGet("invitation/{email}")]
    public async Task<IActionResult> GetInvitationByEmail(string email)
    {
        var invitation = await _context.TeamInvitations
            .Where(i => i.Email == email && !i.IsAccepted)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new 
            {
                i.Id,
                i.Email,
                i.InvitationToken,
                i.TeamId,
                i.Role,
                i.InvitedByUserId,
                i.CreatedAt,
                i.ExpiresAt,
                i.IsAccepted,
                InvitationUrl = $"http://localhost:5173/accept-invitation?token={i.InvitationToken}"
            })
            .FirstOrDefaultAsync();

        if (invitation == null)
        {
            return NotFound($"No pending invitation found for {email}");
        }

        return Ok(invitation);
    }

    [HttpPost("resend-invitation/{invitationId}")]
    public async Task<IActionResult> ResendInvitation(string invitationId, [FromServices] ITeamService teamService)
    {
        var result = await teamService.ResendInvitationAsync(invitationId);
        if (!result)
        {
            return NotFound("Invitation not found or already accepted");
        }

        return Ok(new { message = "Invitation resent successfully", invitationId });
    }
}