using EWHQ.Api.Models.AdminPortal;

namespace EWHQ.Api.Services;

public interface IPermissionService
{
    // Get user roles
    Task<UserRole?> GetUserCompanyRoleAsync(string userId, int companyId);
    Task<UserRole?> GetUserBrandRoleAsync(string userId, int brandId);
    Task<UserRole?> GetUserShopRoleAsync(string userId, int shopId);

    // Check permissions
    Task<bool> HasCompanyPermissionAsync(string userId, int companyId, UserRole minimumRole);
    Task<bool> HasBrandPermissionAsync(string userId, int brandId, UserRole minimumRole);
    Task<bool> HasShopPermissionAsync(string userId, int shopId, UserRole minimumRole);

    // Get user's accessible entities
    Task<List<CompanyWithRole>> GetUserCompaniesAsync(string userId);
    Task<List<BrandWithRole>> GetUserBrandsAsync(string userId);
    Task<List<ShopWithRole>> GetUserShopsAsync(string userId);

    // Manage permissions
    Task<UserCompany> GrantCompanyAccessAsync(string userId, int companyId, UserRole role, string grantedBy);
    Task RevokeCompanyAccessAsync(string userId, int companyId);
}