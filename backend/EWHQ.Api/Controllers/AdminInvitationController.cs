using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EWHQ.Api.Services;

namespace EWHQ.Api.Controllers;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize]
public class AdminInvitationController : ControllerBase
{
    private readonly IAuth0ManagementService _auth0ManagementService;
    private readonly ILogger<AdminInvitationController> _logger;

    public AdminInvitationController(
        IAuth0ManagementService auth0ManagementService,
        ILogger<AdminInvitationController> logger)
    {
        _auth0ManagementService = auth0ManagementService;
        _logger = logger;
    }

    [HttpPost("invite")]
    public async Task<IActionResult> InviteAdminUser([FromBody] InviteAdminUserRequest request)
    {
        try
        {
            _logger.LogInformation($"Inviting admin user: {request.Email}");

            var userId = await _auth0ManagementService.InviteAdminUserAsync(
                request.Email,
                request.FirstName,
                request.LastName,
                request.Role);

            return Ok(new
            {
                success = true,
                message = $"Invitation sent to {request.Email}. They will receive a password reset email to set their password.",
                userId = userId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error inviting admin user: {request.Email}");
            return StatusCode(500, new { message = "Failed to send invitation", error = ex.Message });
        }
    }
}

public class InviteAdminUserRequest
{
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = "Admin";
}