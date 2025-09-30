using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using EWHQ.Api.Data;
using EWHQ.Api.Identity;
using EWHQ.Api.Models.AdminPortal;
using System.Security.Claims;
using System.Text.Json.Serialization;

namespace EWHQ.Api.Controllers;

[ApiController]
[Route("api/user-access")]
[Authorize]
public class UserAccessController : ControllerBase
{
    private readonly AdminPortalDbContext _context;
    private readonly UserProfileDbContext _userContext;
    private readonly ILogger<UserAccessController> _logger;

    public UserAccessController(
        AdminPortalDbContext context,
        UserProfileDbContext userContext,
        ILogger<UserAccessController> logger)
    {
        _context = context;
        _userContext = userContext;
        _logger = logger;
    }

    private async Task<string?> GetCurrentUserIdAsync()
    {
        // Get Auth0 user ID from token
        var auth0UserId = User.FindFirst("sub")?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(auth0UserId))
            return null;

        // Get the actual user from database
        var user = await _userContext.Users.FirstOrDefaultAsync(u => u.Auth0UserId == auth0UserId);
        return user?.Id;
    }

    [HttpGet("companies-brands")]
    public async Task<IActionResult> GetUserCompaniesAndBrands()
    {
        try
        {
            var userId = await GetCurrentUserIdAsync();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not found");
            }

            // Get all companies the user has access to with their brands
            var userCompanies = await _context.UserCompanies
                .Where(uc => uc.UserId == userId && uc.IsActive)
                .Include(uc => uc.Company)
                    .ThenInclude(c => c.Brands.Where(b => b.IsActive))
                .Select(uc => new
                {
                    Company = new
                    {
                        uc.Company.Id,
                        uc.Company.Name,
                        uc.Company.Description
                    },
                    Role = uc.Role.ToString(),
                    Brands = uc.Company.Brands.Select(b => new
                    {
                        b.Id,
                        b.Name,
                        b.Description,
                        b.LogoUrl,
                        b.LegacyAccountId,
                        b.UseLegacyPOS
                    })
                })
                .ToListAsync();

            // Get company IDs that user already has access to
            var companyIds = userCompanies.Select(uc => uc.Company.Id).ToList();

            // Also get brands the user has direct access to (without company access)
            var userBrands = await _context.UserBrands
                .Where(ub => ub.UserId == userId && ub.IsActive)
                .Include(ub => ub.Brand)
                    .ThenInclude(b => b.Company)
                .Where(ub => !companyIds.Contains(ub.Brand.CompanyId))
                .ToListAsync();

            // Convert userBrands to the same format as userCompanies
            var userBrandsFormatted = userBrands
                .Select(ub => new
                {
                    Company = new
                    {
                        ub.Brand.Company.Id,
                        ub.Brand.Company.Name,
                        ub.Brand.Company.Description
                    },
                    Role = ub.Role.ToString(),
                    Brands = new[]
                    {
                        new
                        {
                            ub.Brand.Id,
                            ub.Brand.Name,
                            ub.Brand.Description,
                            ub.Brand.LogoUrl,
                            ub.Brand.LegacyAccountId,
                            ub.Brand.UseLegacyPOS
                        }
                    }.AsEnumerable()
                })
                .ToList();

            // Combine and group results
            var allAccess = userCompanies
                .Concat(userBrandsFormatted)
                .GroupBy(x => x.Company.Id)
                .Select(g => new
                {
                    Company = g.First().Company,
                    Role = g.First().Role,
                    Brands = g.SelectMany(x => x.Brands).Distinct()
                })
                .OrderBy(x => x.Company.Name)
                .ToList();

            return Ok(new
            {
                Success = true,
                Data = allAccess
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching user companies and brands");
            return StatusCode(500, new { Success = false, Message = "An error occurred while fetching data" });
        }
    }

    [HttpPost("select-brand")]
    public async Task<IActionResult> SelectBrand([FromBody] SelectBrandRequest request)
    {
        try
        {
            var userId = await GetCurrentUserIdAsync();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not found");
            }

            // Verify user has access to this brand
            var hasAccess = await _context.UserBrands
                .AnyAsync(ub => ub.UserId == userId && ub.BrandId == request.BrandId && ub.IsActive)
                || await _context.UserCompanies
                    .Include(uc => uc.Company)
                        .ThenInclude(c => c.Brands)
                    .AnyAsync(uc => uc.UserId == userId && uc.IsActive &&
                        uc.Company.Brands.Any(b => b.Id == request.BrandId && b.IsActive));

            if (!hasAccess)
            {
                return Forbid("You don't have access to this brand");
            }

            // Store selected brand in session or return brand details
            // For now, just return success with brand details
            var brand = await _context.Brands
                .Include(b => b.Company)
                .Include(b => b.Shops)
                .FirstOrDefaultAsync(b => b.Id == request.BrandId);

            if (brand == null)
            {
                return NotFound("Brand not found");
            }

            return Ok(new
            {
                Success = true,
                SelectedBrand = new
                {
                    brand.Id,
                    brand.Name,
                    brand.Description,
                    brand.LogoUrl,
                    CompanyId = brand.CompanyId,
                    CompanyName = brand.Company.Name,
                    ShopCount = brand.Shops.Count(s => s.IsActive)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error selecting brand");
            return StatusCode(500, new { Success = false, Message = "An error occurred while selecting brand" });
        }
    }

    [HttpGet("hierarchical-data")]
    public async Task<IActionResult> GetHierarchicalData()
    {
        try
        {
            var userId = await GetCurrentUserIdAsync();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not found");
            }

            // Get all companies the user has access to with full hierarchy
            var userCompanies = await _context.UserCompanies
                .Where(uc => uc.UserId == userId && uc.IsActive)
                .Include(uc => uc.Company)
                    .ThenInclude(c => c.Brands.Where(b => b.IsActive))
                        .ThenInclude(b => b.Shops.Where(s => s.IsActive))
                .ToListAsync();

            var companies = new List<object>();

            foreach (var uc in userCompanies)
            {
                companies.Add(new
                {
                    Id = uc.Company.Id,
                    Name = uc.Company.Name,
                    Description = uc.Company.Description,
                    Role = uc.Role.ToString(),
                    IsActive = uc.Company.IsActive,
                    Brands = uc.Company.Brands.Select(b => new
                    {
                        b.Id,
                        b.Name,
                        b.Description,
                        b.LogoUrl,
                        b.IsActive,
                        Role = _context.UserBrands
                            .FirstOrDefault(ub => ub.UserId == userId && ub.BrandId == b.Id && ub.IsActive)?.Role.ToString(),
                        Shops = b.Shops.Select(s => new
                        {
                            s.Id,
                            s.Name,
                            s.Address,
                            s.IsActive,
                            Role = _context.UserShops
                                .FirstOrDefault(us => us.UserId == userId && us.ShopId == s.Id && us.IsActive)?.Role.ToString()
                        })
                    })
                });
            }

            // Also get brands the user has direct access to (without company access)
            var companyIds = userCompanies.Select(uc => uc.Company.Id).ToList();
            var userBrands = await _context.UserBrands
                .Where(ub => ub.UserId == userId && ub.IsActive)
                .Include(ub => ub.Brand)
                    .ThenInclude(b => b.Company)
                .Include(ub => ub.Brand)
                    .ThenInclude(b => b.Shops.Where(s => s.IsActive))
                .Where(ub => !companyIds.Contains(ub.Brand.CompanyId))
                .ToListAsync();

            foreach (var ub in userBrands)
            {
                var existingCompany = companies.FirstOrDefault(c => ((dynamic)c).Id == ub.Brand.CompanyId);
                if (existingCompany == null)
                {
                    companies.Add(new
                    {
                        Id = ub.Brand.Company.Id,
                        Name = ub.Brand.Company.Name,
                        Description = ub.Brand.Company.Description,
                        Role = (string?)null,
                        IsActive = ub.Brand.Company.IsActive,
                        Brands = new[]
                        {
                            new
                            {
                                ub.Brand.Id,
                                ub.Brand.Name,
                                ub.Brand.Description,
                                ub.Brand.LogoUrl,
                                ub.Brand.IsActive,
                                Role = ub.Role.ToString(),
                                Shops = ub.Brand.Shops.Select(s => new
                                {
                                    s.Id,
                                    s.Name,
                                    s.Address,
                                    s.IsActive,
                                    Role = _context.UserShops
                                        .FirstOrDefault(us => us.UserId == userId && us.ShopId == s.Id && us.IsActive)?.Role.ToString()
                                })
                            }
                        }
                    });
                }
            }

            return Ok(new
            {
                Success = true,
                Data = companies.OrderBy(c => ((dynamic)c).Name)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching hierarchical data");
            return StatusCode(500, new { Success = false, Message = "An error occurred while fetching data" });
        }
    }

    [HttpPost("create-company")]
    public async Task<IActionResult> CreateCompany([FromBody] UserAccessCreateCompanyRequest request)
    {
        try
        {
            var userId = await GetCurrentUserIdAsync();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not found");
            }

            // Create new company
            var company = new Company
            {
                Name = request.Name,
                Description = request.Description,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            // Add user as company owner
            var userCompany = new UserCompany
            {
                UserId = userId,
                CompanyId = company.Id,
                Role = UserRole.Owner,
                IsActive = true
            };

            _context.UserCompanies.Add(userCompany);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Success = true,
                Data = new { company.Id, company.Name, company.Description }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating company");
            return StatusCode(500, new { Success = false, Message = "An error occurred while creating company" });
        }
    }

    [HttpPost("create-brand")]
    public async Task<IActionResult> CreateBrand([FromBody] UserAccessCreateBrandRequest request)
    {
        try
        {
            var userId = await GetCurrentUserIdAsync();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not found");
            }

            // Verify user has company admin access
            var hasAccess = await _context.UserCompanies
                .AnyAsync(uc => uc.UserId == userId && uc.CompanyId == request.ParentId &&
                    uc.IsActive && (uc.Role == UserRole.Owner || uc.Role == UserRole.CompanyAdmin));

            if (!hasAccess)
            {
                return Forbid("You don't have permission to create brands for this company");
            }

            // Create new brand
            var brand = new Brand
            {
                Name = request.Name,
                Description = request.Description,
                CompanyId = request.ParentId,
                LegacyAccountId = request.LegacyAccountId,
                UseLegacyPOS = request.UseLegacyPOS,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.Brands.Add(brand);
            await _context.SaveChangesAsync();

            // Add user as brand admin
            var userBrand = new UserBrand
            {
                UserId = userId,
                BrandId = brand.Id,
                Role = UserRole.BrandAdmin,
                IsActive = true
            };

            _context.UserBrands.Add(userBrand);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Success = true,
                Data = new { brand.Id, brand.Name, brand.Description }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating brand");
            return StatusCode(500, new { Success = false, Message = "An error occurred while creating brand" });
        }
    }

    [HttpPost("create-shop")]
    public async Task<IActionResult> CreateShop([FromBody] UserAccessCreateShopRequest request)
    {
        try
        {
            var userId = await GetCurrentUserIdAsync();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not found");
            }

            // Get the brand to check company access
            var brand = await _context.Brands
                .Include(b => b.Company)
                .FirstOrDefaultAsync(b => b.Id == request.ParentId);

            if (brand == null)
            {
                return NotFound("Brand not found");
            }

            // Verify user has brand admin access or company admin access
            var hasBrandAccess = await _context.UserBrands
                .AnyAsync(ub => ub.UserId == userId && ub.BrandId == request.ParentId &&
                    ub.IsActive && (ub.Role == UserRole.BrandAdmin));

            var hasCompanyAccess = await _context.UserCompanies
                .AnyAsync(uc => uc.UserId == userId && uc.CompanyId == brand.CompanyId &&
                    uc.IsActive && (uc.Role == UserRole.Owner || uc.Role == UserRole.CompanyAdmin));

            if (!hasBrandAccess && !hasCompanyAccess)
            {
                return Forbid("You don't have permission to create shops for this brand");
            }

            // Create new shop
            var shop = new Shop
            {
                Name = request.Name,
                Address = request.Address,
                BrandId = request.ParentId,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.Shops.Add(shop);
            await _context.SaveChangesAsync();

            // Add user as shop manager
            var userShop = new UserShop
            {
                UserId = userId,
                ShopId = shop.Id,
                Role = UserRole.ShopManager,
                IsActive = true
            };

            _context.UserShops.Add(userShop);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Success = true,
                Data = new { shop.Id, shop.Name, shop.Address }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating shop");
            return StatusCode(500, new { Success = false, Message = "An error occurred while creating shop" });
        }
    }

    [HttpPost("update-company")]
    public async Task<IActionResult> UpdateCompany([FromBody] UserAccessUpdateEntityRequest request)
    {
        try
        {
            var userId = await GetCurrentUserIdAsync();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not found");
            }

            var company = await _context.Companies.FindAsync(request.Id);
            if (company == null)
            {
                return NotFound("Company not found");
            }

            // Verify user has company admin access
            var hasAccess = await _context.UserCompanies
                .AnyAsync(uc => uc.UserId == userId && uc.CompanyId == request.Id &&
                    uc.IsActive && (uc.Role == UserRole.Owner || uc.Role == UserRole.CompanyAdmin));

            if (!hasAccess)
            {
                return Forbid("You don't have permission to update this company");
            }

            // Update company
            company.Name = request.Name ?? company.Name;
            company.Description = request.Description ?? company.Description;

            await _context.SaveChangesAsync();

            return Ok(new { Success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating company");
            return StatusCode(500, new { Success = false, Message = "An error occurred while updating company" });
        }
    }

    [HttpPost("update-brand")]
    public async Task<IActionResult> UpdateBrand([FromBody] UserAccessUpdateEntityRequest request)
    {
        try
        {
            var userId = await GetCurrentUserIdAsync();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not found");
            }

            var brand = await _context.Brands
                .Include(b => b.Company)
                .FirstOrDefaultAsync(b => b.Id == request.Id);

            if (brand == null)
            {
                return NotFound("Brand not found");
            }

            // Verify user has brand admin or company admin access
            var hasBrandAccess = await _context.UserBrands
                .AnyAsync(ub => ub.UserId == userId && ub.BrandId == request.Id &&
                    ub.IsActive && (ub.Role == UserRole.BrandAdmin));

            var hasCompanyAccess = await _context.UserCompanies
                .AnyAsync(uc => uc.UserId == userId && uc.CompanyId == brand.CompanyId &&
                    uc.IsActive && (uc.Role == UserRole.Owner || uc.Role == UserRole.CompanyAdmin));

            if (!hasBrandAccess && !hasCompanyAccess)
            {
                return Forbid("You don't have permission to update this brand");
            }

            // Update brand
            brand.Name = request.Name ?? brand.Name;
            brand.Description = request.Description ?? brand.Description;
            if (request.LegacyAccountIdSpecified)
                brand.LegacyAccountId = request.LegacyAccountId;
            if (request.UseLegacyPOS.HasValue)
                brand.UseLegacyPOS = request.UseLegacyPOS.Value;

            await _context.SaveChangesAsync();

            return Ok(new { Success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating brand");
            return StatusCode(500, new { Success = false, Message = "An error occurred while updating brand" });
        }
    }

    [HttpPost("update-shop")]
    public async Task<IActionResult> UpdateShop([FromBody] UserAccessUpdateShopRequest request)
    {
        try
        {
            var userId = await GetCurrentUserIdAsync();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not found");
            }

            var shop = await _context.Shops
                .Include(s => s.Brand)
                    .ThenInclude(b => b.Company)
                .FirstOrDefaultAsync(s => s.Id == request.Id);

            if (shop == null)
            {
                return NotFound("Shop not found");
            }

            // Verify user has shop manager, brand admin, or company admin access
            var hasShopAccess = await _context.UserShops
                .AnyAsync(us => us.UserId == userId && us.ShopId == request.Id &&
                    us.IsActive && (us.Role == UserRole.ShopManager));

            var hasBrandAccess = await _context.UserBrands
                .AnyAsync(ub => ub.UserId == userId && ub.BrandId == shop.BrandId &&
                    ub.IsActive && (ub.Role == UserRole.BrandAdmin));

            var hasCompanyAccess = await _context.UserCompanies
                .AnyAsync(uc => uc.UserId == userId && uc.CompanyId == shop.Brand.CompanyId &&
                    uc.IsActive && (uc.Role == UserRole.Owner || uc.Role == UserRole.CompanyAdmin));

            if (!hasShopAccess && !hasBrandAccess && !hasCompanyAccess)
            {
                return Forbid("You don't have permission to update this shop");
            }

            // Update shop
            shop.Name = request.Name ?? shop.Name;
            shop.Address = request.Address ?? shop.Address;

            await _context.SaveChangesAsync();

            return Ok(new { Success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating shop");
            return StatusCode(500, new { Success = false, Message = "An error occurred while updating shop" });
        }
    }
}

public class SelectBrandRequest
{
    public int BrandId { get; set; }
}

public class UserAccessCreateCompanyRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class UserAccessCreateBrandRequest
{
    public int ParentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? LegacyAccountId { get; set; }
    public bool UseLegacyPOS { get; set; } = false;
}

public class UserAccessCreateShopRequest
{
    public int ParentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
}

public class UserAccessUpdateEntityRequest
{
    private int? _legacyAccountId;
    private bool _legacyAccountIdSpecified;

    public int Id { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }

    public int? LegacyAccountId
    {
        get => _legacyAccountId;
        set
        {
            _legacyAccountId = value;
            _legacyAccountIdSpecified = true;
        }
    }

    [JsonIgnore]
    public bool LegacyAccountIdSpecified => _legacyAccountIdSpecified;

    public bool? UseLegacyPOS { get; set; }
}

public class UserAccessUpdateShopRequest
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public string? Address { get; set; }
}
