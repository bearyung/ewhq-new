using EWHQ.Api.Models.AdminPortal;

namespace EWHQ.Api.Services;

public interface ICompanyService
{
    Task<IEnumerable<Company>> GetCompaniesAsync(string userId, bool isSuperAdmin);
    Task<Company?> GetCompanyByIdAsync(int id, string userId, bool isSuperAdmin);
    Task<Company> CreateCompanyAsync(Company company, string userId);
    Task<Company?> UpdateCompanyAsync(int id, Company company, string userId, bool isSuperAdmin);
    Task<bool> DeleteCompanyAsync(int id, string userId, bool isSuperAdmin);
    Task<bool> CanUserAccessCompanyAsync(int companyId, string userId, bool isSuperAdmin);
}