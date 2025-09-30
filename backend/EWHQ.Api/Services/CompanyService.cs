using Microsoft.EntityFrameworkCore;
using EWHQ.Api.Data;
using EWHQ.Api.Models.AdminPortal;

namespace EWHQ.Api.Services;

public class CompanyService : ICompanyService
{
    private readonly AdminPortalDbContext _context;
    private readonly AdminDbContext _adminContext;
    private readonly ITeamService _teamService;
    private readonly ILogger<CompanyService> _logger;

    public CompanyService(
        AdminPortalDbContext context, 
        AdminDbContext adminContext,
        ITeamService teamService,
        ILogger<CompanyService> logger)
    {
        _context = context;
        _adminContext = adminContext;
        _teamService = teamService;
        _logger = logger;
    }

    public async Task<IEnumerable<Company>> GetCompaniesAsync(string userId, bool isSuperAdmin)
    {
        if (isSuperAdmin)
        {
            // SuperAdmin can see all companies
            return await _context.Companies
                .Include(c => c.Brands)
                    .ThenInclude(b => b.Shops)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        // Get user's teams
        var userTeams = await _teamService.GetUserTeamsAsync(userId);
        var teamIds = userTeams.Select(t => t.Id).ToList();

        // Get team members for teams where user is a leader
        var leaderTeamIds = new List<string>();
        foreach (var teamId in teamIds)
        {
            if (await _teamService.IsUserTeamLeaderAsync(teamId, userId))
            {
                leaderTeamIds.Add(teamId);
            }
        }

        // Build query based on user's role in teams
        var query = _context.Companies.AsQueryable();

        if (leaderTeamIds.Any())
        {
            // If user is a leader in any team, they can see all companies in those teams
            // plus companies they created personally
            query = query.Where(c => 
                leaderTeamIds.Contains(c.TeamId!) || 
                c.CreatedByUserId == userId);
        }
        else if (teamIds.Any())
        {
            // Regular team members can only see companies they created
            query = query.Where(c => c.CreatedByUserId == userId);
        }
        else
        {
            // Users with no team can only see their own companies
            query = query.Where(c => c.CreatedByUserId == userId);
        }

        return await query
            .Include(c => c.Brands)
                .ThenInclude(b => b.Shops)
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<Company?> GetCompanyByIdAsync(int id, string userId, bool isSuperAdmin)
    {
        var company = await _context.Companies
            .Include(c => c.Brands)
                .ThenInclude(b => b.Shops)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (company == null)
            return null;

        // Check if user has access
        if (!await CanUserAccessCompanyAsync(id, userId, isSuperAdmin))
            return null;

        return company;
    }

    public async Task<Company> CreateCompanyAsync(Company company, string userId)
    {
        company.CreatedByUserId = userId;
        company.CreatedAt = DateTime.UtcNow;

        // If user is part of a team, assign the company to their primary team
        var userTeams = await _teamService.GetUserTeamsAsync(userId);
        if (userTeams.Any())
        {
            // Use the first team (you might want to let user choose)
            company.TeamId = userTeams.First().Id;
        }

        _context.Companies.Add(company);
        await _context.SaveChangesAsync();
        
        return company;
    }

    public async Task<Company?> UpdateCompanyAsync(int id, Company company, string userId, bool isSuperAdmin)
    {
        var existingCompany = await _context.Companies.FindAsync(id);
        if (existingCompany == null)
            return null;

        // Check if user has access
        if (!await CanUserAccessCompanyAsync(id, userId, isSuperAdmin))
            return null;

        // Update properties
        existingCompany.Name = company.Name;
        existingCompany.Description = company.Description;
        existingCompany.RegistrationNumber = company.RegistrationNumber;
        existingCompany.TaxId = company.TaxId;
        existingCompany.Address = company.Address;
        existingCompany.City = company.City;
        existingCompany.State = company.State;
        existingCompany.Country = company.Country;
        existingCompany.PostalCode = company.PostalCode;
        existingCompany.Phone = company.Phone;
        existingCompany.Email = company.Email;
        existingCompany.Website = company.Website;
        existingCompany.SubscriptionPlan = company.SubscriptionPlan;
        existingCompany.SubscriptionStartDate = company.SubscriptionStartDate;
        existingCompany.SubscriptionEndDate = company.SubscriptionEndDate;
        existingCompany.IsActive = company.IsActive;
        existingCompany.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return existingCompany;
    }

    public async Task<bool> DeleteCompanyAsync(int id, string userId, bool isSuperAdmin)
    {
        var company = await _context.Companies.FindAsync(id);
        if (company == null)
            return false;

        // Check if user has access
        if (!await CanUserAccessCompanyAsync(id, userId, isSuperAdmin))
            return false;

        // Soft delete
        company.IsActive = false;
        company.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CanUserAccessCompanyAsync(int companyId, string userId, bool isSuperAdmin)
    {
        if (isSuperAdmin)
            return true;

        var company = await _context.Companies.FindAsync(companyId);
        if (company == null)
            return false;

        // User created the company
        if (company.CreatedByUserId == userId)
            return true;

        // User is a team leader in the company's team
        if (!string.IsNullOrEmpty(company.TeamId))
        {
            return await _teamService.IsUserTeamLeaderAsync(company.TeamId, userId);
        }

        return false;
    }
}