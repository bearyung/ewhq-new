using System.Data;
using Npgsql;
using Microsoft.Data.SqlClient;

namespace EWHQ.Api.Services;

/// <summary>
/// Service for managing connections to legacy POS databases
/// </summary>
public interface ILegacyPOSService
{
    Task<IDbConnection?> GetLegacyConnectionAsync(int? legacyAccountId);
    Task<bool> TestLegacyConnectionAsync();
    string GetLegacyConnectionString();
}

public class LegacyPOSService : ILegacyPOSService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<LegacyPOSService> _logger;

    public LegacyPOSService(
        IConfiguration configuration,
        ILogger<LegacyPOSService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public string GetLegacyConnectionString()
    {
        var provider = _configuration["LEGACY_DB_PROVIDER"] ?? "PostgreSQL";

        if (provider.Equals("PostgreSQL", StringComparison.OrdinalIgnoreCase))
        {
            var host = _configuration["LEGACY_DB_HOST"];
            var port = _configuration["LEGACY_DB_PORT"] ?? "5432";
            var database = _configuration["LEGACY_DB_NAME"];
            var userId = _configuration["LEGACY_DB_USER"];
            var password = _configuration["LEGACY_DB_PASSWORD"];
            var sslMode = _configuration["LEGACY_DB_SSL_MODE"] ?? "Require";

            return $"Host={host};Port={port};Database={database};Username={userId};Password={password};SSL Mode={sslMode};";
        }
        else if (provider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
        {
            var server = _configuration["LEGACY_DB_SERVER"];
            var database = _configuration["LEGACY_DB_NAME"];
            var userId = _configuration["LEGACY_DB_USER"];
            var password = _configuration["LEGACY_DB_PASSWORD"];

            return $"Server={server};Database={database};User Id={userId};Password={password};Encrypt=True;TrustServerCertificate=False;";
        }
        else
        {
            throw new NotSupportedException($"Database provider '{provider}' is not supported for legacy POS connection");
        }
    }

    public async Task<IDbConnection?> GetLegacyConnectionAsync(int? legacyAccountId)
    {
        if (!legacyAccountId.HasValue)
        {
            _logger.LogWarning("No legacy account ID provided");
            return null;
        }

        try
        {
            var provider = _configuration["LEGACY_DB_PROVIDER"] ?? "PostgreSQL";
            var connectionString = GetLegacyConnectionString();

            if (provider.Equals("PostgreSQL", StringComparison.OrdinalIgnoreCase))
            {
                var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync();
                _logger.LogInformation($"Successfully connected to legacy POS database for account {legacyAccountId}");
                return connection;
            }
            else
            {
                var connection = new SqlConnection(connectionString);
                await connection.OpenAsync();
                _logger.LogInformation($"Successfully connected to legacy POS database for account {legacyAccountId}");
                return connection;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to connect to legacy POS database for account {legacyAccountId}");
            return null;
        }
    }

    public async Task<bool> TestLegacyConnectionAsync()
    {
        try
        {
            using var connection = await GetLegacyConnectionAsync(1); // Test with dummy ID
            if (connection == null)
            {
                return false;
            }

            using var command = connection.CreateCommand();
            command.CommandText = "SELECT 1";

            // Execute based on connection type
            if (connection is NpgsqlConnection pgConnection)
            {
                using var pgCommand = pgConnection.CreateCommand();
                pgCommand.CommandText = "SELECT 1";
                await pgCommand.ExecuteScalarAsync();
            }
            else if (connection is SqlConnection sqlConnection)
            {
                using var sqlCommand = sqlConnection.CreateCommand();
                sqlCommand.CommandText = "SELECT 1";
                await sqlCommand.ExecuteScalarAsync();
            }

            _logger.LogInformation("Legacy POS database connection test successful");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Legacy POS database connection test failed");
            return false;
        }
    }
}