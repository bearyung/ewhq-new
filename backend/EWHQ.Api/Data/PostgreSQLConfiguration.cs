using Microsoft.EntityFrameworkCore;

namespace EWHQ.Api.Data;

public class PostgreSQLConfiguration : IDatabaseConfiguration
{
    private readonly string _host;
    private readonly string _database;
    private readonly string _username;
    private readonly string _password;
    private readonly int _port;
    private readonly int _connectionTimeout;
    private readonly int _maxPoolSize;
    private readonly int _minPoolSize;
    private readonly string _sslMode;
    private readonly string _channelBinding;

    public DatabaseProvider Provider => DatabaseProvider.PostgreSQL;

    public PostgreSQLConfiguration(
        string host,
        string database,
        string username,
        string password,
        int port = 5432,
        int connectionTimeout = 30,
        int maxPoolSize = 100,
        int minPoolSize = 5,
        string sslMode = "Require",
        string channelBinding = "Prefer")
    {
        _host = host;
        _database = database;
        _username = username;
        _password = password;
        _port = port;
        _connectionTimeout = connectionTimeout;
        _maxPoolSize = maxPoolSize;
        _minPoolSize = minPoolSize;
        _sslMode = sslMode;
        _channelBinding = channelBinding;
    }

    public string BuildConnectionString()
    {
        // For Neon, we need specific SSL settings
        return $"Host={_host};Port={_port};Database={_database};Username={_username};Password={_password};" +
               $"Timeout={_connectionTimeout};Maximum Pool Size={_maxPoolSize};Minimum Pool Size={_minPoolSize};" +
               $"SSL Mode={_sslMode};Trust Server Certificate=true;Include Error Detail=true;" +
               "Keepalive=30;Tcp Keepalive Time=30;Tcp Keepalive Interval=10";
    }

    public void ConfigureDbContext(DbContextOptionsBuilder optionsBuilder, string connectionString)
    {
        optionsBuilder.UseNpgsql(connectionString, npgsqlOptions =>
        {
            npgsqlOptions.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(5),
                errorCodesToAdd: null);
        });
    }
}