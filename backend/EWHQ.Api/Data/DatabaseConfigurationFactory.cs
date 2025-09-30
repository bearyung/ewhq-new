namespace EWHQ.Api.Data;

public static class DatabaseConfigurationFactory
{
    public static IDatabaseConfiguration Create(DatabaseProvider provider, Dictionary<string, string> parameters)
    {
        return provider switch
        {
            DatabaseProvider.SqlServer => CreateSqlServerConfiguration(parameters),
            DatabaseProvider.PostgreSQL => CreatePostgreSQLConfiguration(parameters),
            _ => throw new NotSupportedException($"Database provider {provider} is not supported")
        };
    }

    private static SqlServerConfiguration CreateSqlServerConfiguration(Dictionary<string, string> parameters)
    {
        return new SqlServerConfiguration(
            server: parameters["Server"],
            database: parameters["Database"],
            userId: parameters["UserId"],
            password: parameters["Password"],
            connectionTimeout: parameters.ContainsKey("ConnectionTimeout") ? int.Parse(parameters["ConnectionTimeout"]) : 30,
            maxPoolSize: parameters.ContainsKey("MaxPoolSize") ? int.Parse(parameters["MaxPoolSize"]) : 100,
            minPoolSize: parameters.ContainsKey("MinPoolSize") ? int.Parse(parameters["MinPoolSize"]) : 5
        );
    }

    private static PostgreSQLConfiguration CreatePostgreSQLConfiguration(Dictionary<string, string> parameters)
    {
        return new PostgreSQLConfiguration(
            host: parameters["Host"],
            database: parameters["Database"],
            username: parameters["Username"],
            password: parameters["Password"],
            port: parameters.ContainsKey("Port") ? int.Parse(parameters["Port"]) : 5432,
            connectionTimeout: parameters.ContainsKey("ConnectionTimeout") ? int.Parse(parameters["ConnectionTimeout"]) : 30,
            maxPoolSize: parameters.ContainsKey("MaxPoolSize") ? int.Parse(parameters["MaxPoolSize"]) : 100,
            minPoolSize: parameters.ContainsKey("MinPoolSize") ? int.Parse(parameters["MinPoolSize"]) : 5,
            sslMode: parameters.ContainsKey("SslMode") ? parameters["SslMode"] : "Require",
            channelBinding: parameters.ContainsKey("ChannelBinding") ? parameters["ChannelBinding"] : "Prefer"
        );
    }
}