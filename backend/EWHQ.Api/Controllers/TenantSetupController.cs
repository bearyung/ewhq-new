using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using EWHQ.Api.Data;
using EWHQ.Api.Models.AdminPortal;
using EWHQ.Api.Identity;
using System.Security.Claims;
using System.Linq;

namespace EWHQ.Api.Controllers;

[ApiController]
[Route("api/tenants")]
[Authorize]
public class TenantSetupController : ControllerBase
{
    private readonly AdminPortalDbContext _context;
    private readonly UserProfileDbContext _userContext;
    private readonly ILogger<TenantSetupController> _logger;

    public TenantSetupController(AdminPortalDbContext context, UserProfileDbContext userContext, ILogger<TenantSetupController> logger)
    {
        _context = context;
        _userContext = userContext;
        _logger = logger;
    }

    private string GetCurrentUserId()
    {
        // Auth0 provides the user ID in the 'sub' claim
        var userId = User.FindFirst("sub")?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? string.Empty;

        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Failed to extract user ID from claims. Available claims: {Claims}",
                string.Join(", ", User.Claims.Select(c => $"{c.Type}={c.Value}")));
        }

        return userId;
    }

    private string GetUserEmail()
    {
        return User.FindFirst(ClaimTypes.Email)?.Value
            ?? User.FindFirst("https://posx.one/email")?.Value
            ?? string.Empty;
    }

    [HttpPost("setup")]
    public async Task<IActionResult> SetupTenant([FromBody] TenantSetupRequest request)
    {
        try
        {
            var auth0UserId = GetCurrentUserId();
            var userEmail = GetUserEmail();

            if (string.IsNullOrEmpty(auth0UserId))
            {
                _logger.LogError("User ID not found in token");
                return Unauthorized("User ID not found in token");
            }

            // Get the actual user from database
            var user = await _userContext.Users.FirstOrDefaultAsync(u => u.Auth0UserId == auth0UserId);
            if (user == null)
            {
                _logger.LogError($"User not found in database for Auth0 ID: {auth0UserId}");
                return Unauthorized("User not found in database. Please sync your profile first.");
            }

            var userId = user.Id;
            _logger.LogInformation($"Setting up tenant for user {userId}, email: {userEmail}");

            // Use execution strategy to handle the entire transaction
            var strategy = _context.Database.CreateExecutionStrategy();

            var result = await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    // Create Company
                    var company = new Company
                    {
                        Name = request.CompanyName,
                        Email = userEmail,
                        CreatedByUserId = auth0UserId,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Companies.Add(company);
                    await _context.SaveChangesAsync();

                    // Create Brand
                    var brand = new Brand
                    {
                        Name = request.BrandName,
                        CompanyId = company.Id,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Brands.Add(brand);
                    await _context.SaveChangesAsync();

                    // Create Shop
                    var shop = new Shop
                    {
                        Name = request.ShopName,
                        BrandId = brand.Id,
                        Address = request.ShopAddress,
                        IsActive = true,
                        CreatedBy = auth0UserId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Shops.Add(shop);
                    await _context.SaveChangesAsync();

                    // Create UserCompany relationship (user as Owner)
                    var userCompany = new UserCompany
                    {
                        UserId = userId,
                        UserEmail = userEmail,
                        UserName = request.CompanyName + " Owner", // Default name
                        CompanyId = company.Id,
                        Role = UserRole.Owner,
                        AcceptedAt = DateTime.UtcNow,
                        IsActive = true
                    };

                    _context.UserCompanies.Add(userCompany);
                    await _context.SaveChangesAsync();

                    // Commit the transaction
                    await transaction.CommitAsync();

                    _logger.LogInformation($"Tenant setup completed for user {userId}: Company {company.Id}, Brand {brand.Id}, Shop {shop.Id}");

                    return new TenantSetupResponse
                    {
                        Success = true,
                        Message = "Tenant setup completed successfully",
                        CompanyId = company.Id,
                        BrandId = brand.Id,
                        ShopId = shop.Id
                    };
                }
                catch (Exception)
                {
                    // Rollback on error
                    await transaction.RollbackAsync();
                    throw;
                }
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error setting up tenant for user {GetCurrentUserId()}. Exception: {ex.Message}");
            return StatusCode(500, new {
                success = false,
                message = "An error occurred while setting up the tenant",
                error = ex.Message,
                details = ex.InnerException?.Message ?? ex.StackTrace
            });
        }
    }

    [HttpGet("check-setup")]
    public async Task<IActionResult> CheckSetupStatus()
    {
        try
        {
            var auth0UserId = GetCurrentUserId();

            // Get the actual user from database
            var user = await _userContext.Users.FirstOrDefaultAsync(u => u.Auth0UserId == auth0UserId);
            if (user == null)
            {
                return Ok(new { hasSetup = false });
            }

            var userId = user.Id;

            // Check if user has any company associations
            var userCompanies = await _context.UserCompanies
                .Include(uc => uc.Company)
                    .ThenInclude(c => c.Brands)
                        .ThenInclude(b => b.Shops)
                .Where(uc => uc.UserId == userId && uc.IsActive)
                .ToListAsync();

            if (!userCompanies.Any())
            {
                return Ok(new { hasSetup = false });
            }

            // Return the first company for now (TODO: handle multiple companies)
            var firstUserCompany = userCompanies.First();
            var company = firstUserCompany.Company;
            var hasBrands = company.Brands?.Any(b => b.IsActive) ?? false;
            var hasShops = company.Brands?.Any(b => b.Shops?.Any(s => s.IsActive) ?? false) ?? false;

            return Ok(new
            {
                hasSetup = true,
                companyId = company.Id,
                companyName = company.Name,
                role = firstUserCompany.Role.ToString(),
                hasBrands = hasBrands,
                hasShops = hasShops,
                totalCompanies = userCompanies.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking setup status");
            return StatusCode(500, new { success = false, message = "An error occurred while checking setup status" });
        }
    }
}

public class TenantSetupRequest
{
    public string CompanyName { get; set; } = string.Empty;
    public string BrandName { get; set; } = string.Empty;
    public string ShopName { get; set; } = string.Empty;
    public string ShopAddress { get; set; } = string.Empty;
}

public class TenantSetupResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public int BrandId { get; set; }
    public int ShopId { get; set; }
}