# EWHQ DbContext Generator

A command-line tool that automatically generates a comprehensive Entity Framework Core DbContext by scanning entity classes in the EWHQ.Api project.

## Purpose

This tool automates the process of maintaining the `EWHQDbContext` class when entities are added, modified, or removed. Instead of manually updating the DbContext with 200+ entities and their configurations, this generator:

- Scans all entity classes in `/Models/Entities`
- Detects composite key configurations
- Generates proper DbSet properties with correct pluralization
- Creates all necessary key configurations
- Handles database-specific configurations for SQL Server and PostgreSQL

## Prerequisites

- .NET 9.0 SDK
- Access to the EWHQ.Api project source code

## Usage

### Running the Generator

From the project directory:

```bash
cd backend/EWHQ.DbContextGenerator
dotnet run
```

Or from the solution root:

```bash
dotnet run --project backend/EWHQ.DbContextGenerator/EWHQ.DbContextGenerator.csproj
```

### Output

The tool generates a file named `EWHQDbContext.generated.cs` in the `backend/EWHQ.Api/Data/` directory.

### Applying the Generated Context

1. **Backup the existing context** (automatically saved as `EWHQDbContext.cs.backup`):
   ```bash
   cp backend/EWHQ.Api/Data/EWHQDbContext.cs backend/EWHQ.Api/Data/EWHQDbContext.cs.backup
   ```

2. **Replace the existing context with the generated one**:
   ```bash
   cp backend/EWHQ.Api/Data/EWHQDbContext.generated.cs backend/EWHQ.Api/Data/EWHQDbContext.cs
   ```

3. **Create a new migration**:
   ```bash
   cd backend/EWHQ.Api
   dotnet ef migrations add UpdatedEntities --context EWHQDbContext
   ```

4. **Update the database**:
   ```bash
   dotnet ef database update --context EWHQDbContext
   ```

## Features

### Automatic Entity Detection
- Scans all `.cs` files in `/Models/Entities`
- Identifies public classes as entities
- Excludes ViewModels, DTOs, and other non-entity classes

### Composite Key Configuration
- Detects `[Key]` attributes on properties
- Recognizes `[Column(Order = n)]` attributes for composite key ordering
- Generates proper EF Core composite key configurations

### Smart Pluralization
- Handles standard English pluralization rules
- Special cases for words ending in 'y', 's', 'x', etc.
- Preserves non-pluralizable names (e.g., "Data", "Info")

### Database Provider Support
- Generates configurations for both SQL Server and PostgreSQL
- Handles `MaxLengthUnlimited` attributes appropriately for each provider
- Uses runtime detection for database-specific configurations

## Generated Code Structure

The generated DbContext includes:

1. **Constructor**: Standard EF Core DbContext constructor
2. **DbSet Properties**: One for each entity with proper pluralization
3. **OnModelCreating**: Calls configuration methods
4. **ConfigureEntityKeys**: All composite key configurations
5. **ApplyDatabaseSpecificConfigurations**: Provider-specific settings

## Example Output

```csharp
public class EWHQDbContext : DbContext
{
    public EWHQDbContext(DbContextOptions<EWHQDbContext> options) : base(options)
    {
    }

    #region DbSets
    
    public DbSet<AccountMaster> AccountMasters { get; set; }
    public DbSet<Shop> Shops { get; set; }
    public DbSet<User> Users { get; set; }
    // ... 200+ more entities
    
    #endregion

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        ConfigureEntityKeys(modelBuilder);
        ApplyDatabaseSpecificConfigurations(modelBuilder);
    }
    
    // ... configuration methods
}
```

## Troubleshooting

### "Entities directory not found"
- Ensure you're running from the correct directory
- Check that the EWHQ.Api project exists with `/Models/Entities` folder

### Build errors after applying generated context
- Review any custom configurations in your original DbContext
- Ensure all entities have proper key attributes defined
- Check for any manual relationships that need to be added

### Missing composite key configurations
- Verify entities have `[Key]` and `[Column(Order = n)]` attributes
- Check that the entity classes are public

## Maintenance

When adding new entities:
1. Create the entity class in `/Models/Entities`
2. Add appropriate `[Key]` attributes
3. Run the generator
4. Apply the generated context
5. Create and apply migrations

## Technical Details

The generator uses:
- **Microsoft.CodeAnalysis** (Roslyn) for parsing C# syntax
- Pattern matching for entity identification
- Attribute analysis for key detection
- Custom pluralization logic for DbSet naming