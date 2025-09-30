using EWHQ.Api.Data;
using EWHQ.Api.Models.AdminPortal;
using Microsoft.EntityFrameworkCore;

namespace EWHQ.Api.Services;

public class AdminDatabaseSeeder
{
    private readonly AdminDbContext _context;
    private readonly ILogger<AdminDatabaseSeeder> _logger;

    public AdminDatabaseSeeder(AdminDbContext context, ILogger<AdminDatabaseSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<bool> SeedSampleTeamsAsync(bool forceClear = false)
    {
        try
        {
            if (forceClear)
            {
                _logger.LogInformation("Force clearing existing data...");
                
                // Clear existing data in correct order
                _context.TeamMembers.RemoveRange(_context.TeamMembers);
                _context.Teams.RemoveRange(_context.Teams);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Existing data cleared");
            }
            
            // Check if we already have data
            var existingTeams = await _context.Teams.CountAsync();
            if (existingTeams > 0 && !forceClear)
            {
                _logger.LogInformation($"Found {existingTeams} teams already in database, skipping seed");
                return true;
            }

            // Create sample teams
            var teams = new List<Team>
            {
                new Team
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Sales Team North",
                    Description = "Sales team covering northern region",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "system"
                },
                new Team
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Sales Team South",
                    Description = "Sales team covering southern region",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "system"
                },
                new Team
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Enterprise Sales",
                    Description = "Team handling enterprise customers",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "system"
                },
                new Team
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Direct Sales",
                    Description = "Team handling direct web subscriptions",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "system"
                }
            };

            await _context.Teams.AddRangeAsync(teams);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Successfully seeded {teams.Count} teams");
            
            // Note: In a real scenario, you would also add some sample team members here
            // For now, we'll let the admin add team members through the UI
            
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding admin database");
            return false;
        }
    }
}