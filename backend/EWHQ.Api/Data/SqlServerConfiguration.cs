using Microsoft.EntityFrameworkCore;

namespace EWHQ.Api.Data;

public class SqlServerConfiguration : IDatabaseConfiguration
{
    private readonly string _server;
    private readonly string _database;
    private readonly string _userId;
    private readonly string _password;
    private readonly int _connectionTimeout;
    private readonly int _maxPoolSize;
    private readonly int _minPoolSize;

    public DatabaseProvider Provider => DatabaseProvider.SqlServer;

    public SqlServerConfiguration(
        string server,
        string database,
        string userId,
        string password,
        int connectionTimeout = 30,
        int maxPoolSize = 100,
        int minPoolSize = 5)
    {
        _server = server;
        _database = database;
        _userId = userId;
        _password = password;
        _connectionTimeout = connectionTimeout;
        _maxPoolSize = maxPoolSize;
        _minPoolSize = minPoolSize;
    }

    public string BuildConnectionString()
    {
        return $"Server={_server};Database={_database};User Id={_userId};Password={_password};" +
               $"Connection Timeout={_connectionTimeout};Max Pool Size={_maxPoolSize};Min Pool Size={_minPoolSize};" +
               "Encrypt=True;TrustServerCertificate=False";
    }

    public void ConfigureDbContext(DbContextOptionsBuilder optionsBuilder, string connectionString)
    {
        optionsBuilder.UseSqlServer(connectionString);
    }
}