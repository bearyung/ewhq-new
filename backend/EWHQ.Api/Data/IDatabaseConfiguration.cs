using Microsoft.EntityFrameworkCore;

namespace EWHQ.Api.Data;

public interface IDatabaseConfiguration
{
    DatabaseProvider Provider { get; }
    string BuildConnectionString();
    void ConfigureDbContext(DbContextOptionsBuilder optionsBuilder, string connectionString);
}