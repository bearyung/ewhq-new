using Microsoft.EntityFrameworkCore;
using EWHQ.Api.Data;
using EWHQ.Api.Models.AdminPortal;

namespace EWHQ.Api.Services;

public class PermissionService : IPermissionService
{
    private readonly AdminPortalDbContext _context;
    private readonly ILogger<PermissionService> _logger;

    public PermissionService(AdminPortalDbContext context, ILogger<PermissionService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get user's effective role for a company (direct or highest inherited)
    /// </summary>
    public async Task<UserRole?> GetUserCompanyRoleAsync(string userId, int companyId)
    {
        var userCompany = await _context.UserCompanies
            .FirstOrDefaultAsync(uc => uc.UserId == userId && uc.CompanyId == companyId && uc.IsActive);

        return userCompany?.Role;
    }

    /// <summary>
    /// Get user's effective role for a brand (direct or inherited from company)
    /// </summary>
    public async Task<UserRole?> GetUserBrandRoleAsync(string userId, int brandId)
    {
        // First check direct brand permission
        var userBrand = await _context.UserBrands
            .FirstOrDefaultAsync(ub => ub.UserId == userId && ub.BrandId == brandId && ub.IsActive);

        if (userBrand != null)
            return userBrand.Role;

        // Check inherited from company
        var brand = await _context.Brands
            .Include(b => b.Company)
                .ThenInclude(c => c.UserCompanies)
            .FirstOrDefaultAsync(b => b.Id == brandId);

        if (brand?.Company != null)
        {
            var userCompany = brand.Company.UserCompanies
                .FirstOrDefault(uc => uc.UserId == userId && uc.IsActive);

            if (userCompany != null)
            {
                // Inherit company role
                return userCompany.Role;
            }
        }

        return null;
    }

    /// <summary>
    /// Get user's effective role for a shop (direct or inherited from brand/company)
    /// </summary>
    public async Task<UserRole?> GetUserShopRoleAsync(string userId, int shopId)
    {
        // First check direct shop permission
        var userShop = await _context.UserShops
            .FirstOrDefaultAsync(us => us.UserId == userId && us.ShopId == shopId && us.IsActive);

        if (userShop != null)
            return userShop.Role;

        // Check inherited from brand
        var shop = await _context.Shops
            .Include(s => s.Brand)
                .ThenInclude(b => b.Company)
                    .ThenInclude(c => c.UserCompanies)
            .Include(s => s.Brand)
                .ThenInclude(b => b.UserBrands)
            .FirstOrDefaultAsync(s => s.Id == shopId);

        if (shop?.Brand != null)
        {
            // Check brand permission
            var userBrand = shop.Brand.UserBrands
                .FirstOrDefault(ub => ub.UserId == userId && ub.IsActive);

            if (userBrand != null)
                return userBrand.Role;

            // Check company permission
            if (shop.Brand.Company != null)
            {
                var userCompany = shop.Brand.Company.UserCompanies
                    .FirstOrDefault(uc => uc.UserId == userId && uc.IsActive);

                if (userCompany != null)
                    return userCompany.Role;
            }
        }

        return null;
    }

    /// <summary>
    /// Check if user has minimum required role for a company
    /// </summary>
    public async Task<bool> HasCompanyPermissionAsync(string userId, int companyId, UserRole minimumRole)
    {
        var userRole = await GetUserCompanyRoleAsync(userId, companyId);
        return userRole.HasValue && userRole.Value <= minimumRole; // Lower enum value = higher permission
    }

    /// <summary>
    /// Check if user has minimum required role for a brand
    /// </summary>
    public async Task<bool> HasBrandPermissionAsync(string userId, int brandId, UserRole minimumRole)
    {
        var userRole = await GetUserBrandRoleAsync(userId, brandId);
        return userRole.HasValue && userRole.Value <= minimumRole;
    }

    /// <summary>
    /// Check if user has minimum required role for a shop
    /// </summary>
    public async Task<bool> HasShopPermissionAsync(string userId, int shopId, UserRole minimumRole)
    {
        var userRole = await GetUserShopRoleAsync(userId, shopId);
        return userRole.HasValue && userRole.Value <= minimumRole;
    }

    /// <summary>
    /// Get all companies a user has access to
    /// </summary>
    public async Task<List<CompanyWithRole>> GetUserCompaniesAsync(string userId)
    {
        var userCompanies = await _context.UserCompanies
            .Include(uc => uc.Company)
            .Where(uc => uc.UserId == userId && uc.IsActive)
            .Select(uc => new CompanyWithRole
            {
                Company = uc.Company,
                Role = uc.Role,
                Source = PermissionSource.Direct
            })
            .ToListAsync();

        return userCompanies;
    }

    /// <summary>
    /// Get all brands a user has access to (direct or inherited)
    /// </summary>
    public async Task<List<BrandWithRole>> GetUserBrandsAsync(string userId)
    {
        var result = new List<BrandWithRole>();

        // Direct brand permissions
        var directBrands = await _context.UserBrands
            .Include(ub => ub.Brand)
            .Where(ub => ub.UserId == userId && ub.IsActive)
            .Select(ub => new BrandWithRole
            {
                Brand = ub.Brand,
                Role = ub.Role,
                Source = PermissionSource.Direct
            })
            .ToListAsync();

        result.AddRange(directBrands);

        // Inherited from companies
        var companyBrands = await _context.UserCompanies
            .Include(uc => uc.Company)
                .ThenInclude(c => c.Brands)
            .Where(uc => uc.UserId == userId && uc.IsActive)
            .SelectMany(uc => uc.Company.Brands.Select(b => new BrandWithRole
            {
                Brand = b,
                Role = uc.Role,
                Source = PermissionSource.Inherited
            }))
            .ToListAsync();

        // Add inherited brands not already in direct list
        foreach (var cb in companyBrands)
        {
            if (!result.Any(r => r.Brand.Id == cb.Brand.Id))
                result.Add(cb);
        }

        return result;
    }

    /// <summary>
    /// Get all shops a user has access to (direct or inherited)
    /// </summary>
    public async Task<List<ShopWithRole>> GetUserShopsAsync(string userId)
    {
        var result = new List<ShopWithRole>();

        // Direct shop permissions
        var directShops = await _context.UserShops
            .Include(us => us.Shop)
            .Where(us => us.UserId == userId && us.IsActive)
            .Select(us => new ShopWithRole
            {
                Shop = us.Shop,
                Role = us.Role,
                Source = PermissionSource.Direct
            })
            .ToListAsync();

        result.AddRange(directShops);

        // Inherited from brands
        var brandShops = await _context.UserBrands
            .Include(ub => ub.Brand)
                .ThenInclude(b => b.Shops)
            .Where(ub => ub.UserId == userId && ub.IsActive)
            .SelectMany(ub => ub.Brand.Shops.Select(s => new ShopWithRole
            {
                Shop = s,
                Role = ub.Role,
                Source = PermissionSource.Inherited
            }))
            .ToListAsync();

        foreach (var bs in brandShops)
        {
            if (!result.Any(r => r.Shop.Id == bs.Shop.Id))
                result.Add(bs);
        }

        // Inherited from companies
        var companyShops = await _context.UserCompanies
            .Include(uc => uc.Company)
                .ThenInclude(c => c.Brands)
                    .ThenInclude(b => b.Shops)
            .Where(uc => uc.UserId == userId && uc.IsActive)
            .SelectMany(uc => uc.Company.Brands.SelectMany(b => b.Shops.Select(s => new ShopWithRole
            {
                Shop = s,
                Role = uc.Role,
                Source = PermissionSource.Inherited
            })))
            .ToListAsync();

        foreach (var cs in companyShops)
        {
            if (!result.Any(r => r.Shop.Id == cs.Shop.Id))
                result.Add(cs);
        }

        return result;
    }

    /// <summary>
    /// Grant user access to a company
    /// </summary>
    public async Task<UserCompany> GrantCompanyAccessAsync(string userId, int companyId, UserRole role, string grantedBy)
    {
        // Check if already exists
        var existing = await _context.UserCompanies
            .FirstOrDefaultAsync(uc => uc.UserId == userId && uc.CompanyId == companyId);

        if (existing != null)
        {
            existing.Role = role;
            existing.IsActive = true;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            existing = new UserCompany
            {
                UserId = userId,
                CompanyId = companyId,
                Role = role,
                InvitedBy = grantedBy,
                InvitedAt = DateTime.UtcNow,
                AcceptedAt = DateTime.UtcNow,
                IsActive = true
            };
            _context.UserCompanies.Add(existing);
        }

        await _context.SaveChangesAsync();
        return existing;
    }

    /// <summary>
    /// Revoke user access to a company (and cascade to brands/shops)
    /// </summary>
    public async Task RevokeCompanyAccessAsync(string userId, int companyId)
    {
        var userCompany = await _context.UserCompanies
            .FirstOrDefaultAsync(uc => uc.UserId == userId && uc.CompanyId == companyId);

        if (userCompany != null)
        {
            userCompany.IsActive = false;
            userCompany.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}

// DTOs for permission results
public class CompanyWithRole
{
    public Company Company { get; set; } = null!;
    public UserRole Role { get; set; }
    public PermissionSource Source { get; set; }
}

public class BrandWithRole
{
    public Brand Brand { get; set; } = null!;
    public UserRole Role { get; set; }
    public PermissionSource Source { get; set; }
}

public class ShopWithRole
{
    public Shop Shop { get; set; } = null!;
    public UserRole Role { get; set; }
    public PermissionSource Source { get; set; }
}