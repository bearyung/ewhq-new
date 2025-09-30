# Database Configuration Guide

This backend supports both SQL Server and PostgreSQL databases in hybrid mode. You can switch between database providers using environment variables.

## Configuration

### 1. Set Database Provider

Add the following to your `.env` file:

```env
# Valid values: SqlServer, PostgreSQL
DB_PROVIDER=SqlServer
```

### 2. SQL Server Configuration

For SQL Server, use these environment variables:

```env
DB_PROVIDER=SqlServer

# Main Database
DB_SERVER=your-server.database.windows.net
DB_NAME=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password

# Identity Database (can be same as main DB)
IDENTITY_DB_SERVER=your-server.database.windows.net
IDENTITY_DB_NAME=your-identity-database-name
IDENTITY_DB_USER=your-username
IDENTITY_DB_PASSWORD=your-password

# Optional Connection Pool Settings
DB_CONNECTION_TIMEOUT=30
DB_MAX_POOL_SIZE=100
DB_MIN_POOL_SIZE=5
```

### 3. PostgreSQL Configuration

For PostgreSQL, use these environment variables:

```env
DB_PROVIDER=PostgreSQL

# Main Database
DB_HOST=your-postgresql-host.com
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password

# Identity Database (can be same as main DB)
IDENTITY_DB_HOST=your-postgresql-host.com
IDENTITY_DB_PORT=5432
IDENTITY_DB_NAME=your-identity-database-name
IDENTITY_DB_USER=your-username
IDENTITY_DB_PASSWORD=your-password

# Optional Connection Pool Settings
DB_CONNECTION_TIMEOUT=30
DB_MAX_POOL_SIZE=100
DB_MIN_POOL_SIZE=5
```

## Database-Specific Considerations

### Data Types

The system automatically handles database-specific data types:

- **Unlimited Text Fields**: 
  - SQL Server: `nvarchar(max)`
  - PostgreSQL: `text`
  - Use `[MaxLengthUnlimited]` attribute in entity models

- **Decimal Fields**: Both databases support decimal types with precision

### Case Sensitivity

- **SQL Server**: Case-insensitive by default
- **PostgreSQL**: Case-sensitive by default. The system handles this automatically in queries.

### Schema Names

- **Identity Schema**: Both databases support schema separation for Identity tables
- PostgreSQL requires lowercase schema names unless quoted

## Migration Strategy

### For New Deployments

1. Set your `DB_PROVIDER` in the `.env` file
2. Run Entity Framework migrations:
   ```bash
   dotnet ef database update
   ```

### For Existing SQL Server to PostgreSQL Migration

1. Export data from SQL Server
2. Update `.env` file to use PostgreSQL settings
3. Create PostgreSQL database
4. Run migrations on PostgreSQL
5. Import data with appropriate transformations

### For Existing PostgreSQL to SQL Server Migration

1. Export data from PostgreSQL
2. Update `.env` file to use SQL Server settings
3. Create SQL Server database
4. Run migrations on SQL Server
5. Import data with appropriate transformations

## Testing Database Compatibility

To ensure your code works with both databases:

1. Test with SQL Server:
   ```env
   DB_PROVIDER=SqlServer
   ```

2. Test with PostgreSQL:
   ```env
   DB_PROVIDER=PostgreSQL
   ```

3. Key areas to test:
   - String comparisons and searches
   - Date/time operations
   - Decimal calculations
   - Transaction handling
   - Concurrent access patterns

## Troubleshooting

### Connection Issues

- **SQL Server**: Ensure `Encrypt=True` is supported by your server
- **PostgreSQL**: Check SSL mode settings match your server configuration

### Performance Differences

- Index strategies may differ between databases
- Query execution plans can vary
- Monitor and optimize for each database separately

### Data Type Issues

- If you encounter data type errors, check entity model attributes
- Ensure `[MaxLengthUnlimited]` is used instead of `[MaxLength(max)]`
- Verify decimal precision specifications are compatible