using System.Text;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace EWHQ.Api.EWHQ.DbContextGenerator;

class EntityInfo
{
    public string ClassName { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}

class EntityKeyInfo
{
    public string ClassName { get; set; } = string.Empty;
    public List<KeyProperty> KeyProperties { get; set; } = new();
    public bool HasCompositeKey => KeyProperties.Count > 1;
}

class KeyProperty
{
    public string PropertyName { get; set; } = string.Empty;
    public int Order { get; set; }
}

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("EWHQ DbContext Generator");
        Console.WriteLine("========================");

        var projectRoot = GetProjectRoot();
        Console.WriteLine($"Project root: {projectRoot}");
        
        var entitiesPath = Path.Combine(projectRoot, "backend", "EWHQ.Api", "Models", "Entities");
        var outputPath = Path.Combine(projectRoot, "backend", "EWHQ.Api", "Data", "EWHQDbContext.generated.cs");

        if (!Directory.Exists(entitiesPath))
        {
            Console.WriteLine($"Error: Entities directory not found at {entitiesPath}");
            Console.WriteLine($"Current directory: {Directory.GetCurrentDirectory()}");
            return;
        }

        Console.WriteLine($"Scanning entities in: {entitiesPath}");
        
        var entityClasses = ScanForEntityClasses(entitiesPath);
        Console.WriteLine($"Found {entityClasses.Count} entity classes");
        
        var entityKeyInfos = AnalyzeEntityKeys(entitiesPath, entityClasses);
        Console.WriteLine($"Analyzed keys for {entityKeyInfos.Count} entities");

        var dbContextCode = GenerateDbContext(entityClasses, entityKeyInfos);
        
        File.WriteAllText(outputPath, dbContextCode);
        Console.WriteLine($"Generated DbContext saved to: {outputPath}");
        
        Console.WriteLine("\nNext steps:");
        Console.WriteLine("1. Review the generated file");
        Console.WriteLine("2. Replace the existing EWHQDbContext.cs with the generated content");
        Console.WriteLine("3. Run migrations to update the database schema");
    }

    static string GetProjectRoot()
    {
        var currentDir = Directory.GetCurrentDirectory();
        while (!File.Exists(Path.Combine(currentDir, "ewhq.sln")) && currentDir != Path.GetPathRoot(currentDir))
        {
            currentDir = Directory.GetParent(currentDir)?.FullName ?? currentDir;
        }
        
        // If we couldn't find the solution file, try a fallback approach
        if (!File.Exists(Path.Combine(currentDir, "ewhq.sln")))
        {
            // Assume we're in backend/EWHQ.DbContextGenerator, go up two levels
            currentDir = Directory.GetParent(Directory.GetCurrentDirectory())?.Parent?.FullName ?? currentDir;
        }
        
        return currentDir;
    }

    static List<EntityInfo> ScanForEntityClasses(string entitiesPath)
    {
        var entityClasses = new List<EntityInfo>();
        var csFiles = Directory.GetFiles(entitiesPath, "*.cs", SearchOption.TopDirectoryOnly);

        foreach (var file in csFiles)
        {
            var content = File.ReadAllText(file);
            var tree = CSharpSyntaxTree.ParseText(content);
            var root = tree.GetRoot();

            var classDeclarations = root.DescendantNodes()
                .OfType<ClassDeclarationSyntax>()
                .Where(c => c.Modifiers.Any(m => m.Kind() == SyntaxKind.PublicKeyword))
                .ToList();

            foreach (var classDecl in classDeclarations)
            {
                var className = classDecl.Identifier.Text;
                
                // Skip certain classes that might not be entities
                if (className.EndsWith("ViewModel") || className.EndsWith("Dto") || className.EndsWith("Request") || className.EndsWith("Response"))
                    continue;

                entityClasses.Add(new EntityInfo
                {
                    ClassName = className,
                    FileName = Path.GetFileName(file)
                });
            }
        }

        return entityClasses.OrderBy(e => e.ClassName).ToList();
    }

    static List<EntityKeyInfo> AnalyzeEntityKeys(string entitiesPath, List<EntityInfo> entities)
    {
        var keyInfos = new List<EntityKeyInfo>();
        
        foreach (var entity in entities)
        {
            var filePath = Path.Combine(entitiesPath, entity.FileName);
            if (!File.Exists(filePath))
                continue;
                
            var content = File.ReadAllText(filePath);
            var tree = CSharpSyntaxTree.ParseText(content);
            var compilation = CSharpCompilation.Create("temp")
                .AddReferences(MetadataReference.CreateFromFile(typeof(object).Assembly.Location))
                .AddSyntaxTrees(tree);
            var semanticModel = compilation.GetSemanticModel(tree);
            var root = tree.GetRoot();
            
            var classDecl = root.DescendantNodes()
                .OfType<ClassDeclarationSyntax>()
                .FirstOrDefault(c => c.Identifier.Text == entity.ClassName);
                
            if (classDecl == null)
                continue;
                
            var keyInfo = new EntityKeyInfo { ClassName = entity.ClassName };
            
            var properties = classDecl.DescendantNodes()
                .OfType<PropertyDeclarationSyntax>()
                .Where(p => p.AttributeLists.Any(al => 
                    al.Attributes.Any(a => a.Name.ToString().Contains("Key"))))
                .ToList();
                
            foreach (var prop in properties)
            {
                var keyProp = new KeyProperty
                {
                    PropertyName = prop.Identifier.Text,
                    Order = 0
                };
                
                // Look for Column(Order = n) attribute
                var columnAttr = prop.AttributeLists
                    .SelectMany(al => al.Attributes)
                    .FirstOrDefault(a => a.Name.ToString().Contains("Column"));
                    
                if (columnAttr != null && columnAttr.ArgumentList != null)
                {
                    var orderArg = columnAttr.ArgumentList.Arguments
                        .FirstOrDefault(arg => arg.NameEquals?.Name.ToString() == "Order");
                        
                    if (orderArg != null && orderArg.Expression is LiteralExpressionSyntax literal)
                    {
                        if (int.TryParse(literal.Token.Text, out int order))
                        {
                            keyProp.Order = order;
                        }
                    }
                }
                
                keyInfo.KeyProperties.Add(keyProp);
            }
            
            if (keyInfo.KeyProperties.Any())
            {
                keyInfo.KeyProperties = keyInfo.KeyProperties.OrderBy(k => k.Order).ToList();
                keyInfos.Add(keyInfo);
            }
        }
        
        return keyInfos;
    }

    static string GenerateDbContext(List<EntityInfo> entities, List<EntityKeyInfo> keyInfos)
    {
        var sb = new StringBuilder();
        
        // Header
        sb.AppendLine("using Microsoft.EntityFrameworkCore;");
        sb.AppendLine("using EWHQ.Api.Models.Entities;");
        sb.AppendLine("using EWHQ.Api.Data.Attributes;");
        sb.AppendLine("using System.Reflection;");
        sb.AppendLine("using System.ComponentModel.DataAnnotations;");
        sb.AppendLine();
        sb.AppendLine("namespace EWHQ.Api.Data;");
        sb.AppendLine();
        sb.AppendLine("/// <summary>");
        sb.AppendLine("/// Database context for EWHQ Portal (POS system) data");
        sb.AppendLine("/// This file is auto-generated. Do not modify directly.");
        sb.AppendLine($"/// Generated on: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
        sb.AppendLine("/// </summary>");
        sb.AppendLine("public class EWHQDbContext : DbContext");
        sb.AppendLine("{");
        sb.AppendLine("    public EWHQDbContext(DbContextOptions<EWHQDbContext> options) : base(options)");
        sb.AppendLine("    {");
        sb.AppendLine("    }");
        sb.AppendLine();
        
        // DbSet properties
        sb.AppendLine("    #region DbSets");
        sb.AppendLine();
        foreach (var entity in entities)
        {
            var pluralName = Pluralize(entity.ClassName);
            sb.AppendLine($"    public DbSet<{entity.ClassName}> {pluralName} {{ get; set; }}");
        }
        sb.AppendLine();
        sb.AppendLine("    #endregion");
        sb.AppendLine();
        
        // OnModelCreating
        sb.AppendLine("    protected override void OnModelCreating(ModelBuilder modelBuilder)");
        sb.AppendLine("    {");
        sb.AppendLine("        base.OnModelCreating(modelBuilder);");
        sb.AppendLine();
        sb.AppendLine("        // Configure composite keys and special entity configurations");
        sb.AppendLine("        ConfigureEntityKeys(modelBuilder);");
        sb.AppendLine();
        sb.AppendLine("        // Apply database-specific configurations");
        sb.AppendLine("        ApplyDatabaseSpecificConfigurations(modelBuilder);");
        sb.AppendLine("    }");
        sb.AppendLine();
        
        // ConfigureEntityKeys method
        sb.AppendLine("    private void ConfigureEntityKeys(ModelBuilder modelBuilder)");
        sb.AppendLine("    {");
        
        var compositeKeyEntities = keyInfos.Where(k => k.HasCompositeKey).OrderBy(k => k.ClassName).ToList();
        
        if (compositeKeyEntities.Any())
        {
            sb.AppendLine("        // Configure composite keys");
            foreach (var keyInfo in compositeKeyEntities)
            {
                var keyProperties = string.Join(", ", keyInfo.KeyProperties.Select(p => $"e.{p.PropertyName}"));
                sb.AppendLine($"        modelBuilder.Entity<{keyInfo.ClassName}>()");
                sb.AppendLine($"            .HasKey(e => new {{ {keyProperties} }});");
                sb.AppendLine();
            }
        }
        
        // Special configurations for Shop
        if (entities.Any(e => e.ClassName == "Shop"))
        {
            sb.AppendLine("        // Shop special configuration");
            sb.AppendLine("        modelBuilder.Entity<Shop>()");
            sb.AppendLine("            .Property(s => s.ShopId)");
            sb.AppendLine("            .ValueGeneratedOnAdd();");
            sb.AppendLine();
        }
        
        sb.AppendLine("    }");
        sb.AppendLine();
        
        // ApplyDatabaseSpecificConfigurations method
        sb.AppendLine("    private void ApplyDatabaseSpecificConfigurations(ModelBuilder modelBuilder)");
        sb.AppendLine("    {");
        sb.AppendLine("        var isPostgreSQL = Database.IsNpgsql();");
        sb.AppendLine("        ");
        sb.AppendLine("        // Configure string properties with MaxLengthUnlimited attribute");
        sb.AppendLine("        foreach (var entityType in modelBuilder.Model.GetEntityTypes())");
        sb.AppendLine("        {");
        sb.AppendLine("            foreach (var property in entityType.GetProperties())");
        sb.AppendLine("            {");
        sb.AppendLine("                if (property.PropertyInfo != null)");
        sb.AppendLine("                {");
        sb.AppendLine("                    var maxLengthAttr = property.PropertyInfo.GetCustomAttribute<MaxLengthAttribute>();");
        sb.AppendLine("                    if (maxLengthAttr is MaxLengthUnlimitedAttribute)");
        sb.AppendLine("                    {");
        sb.AppendLine("                        if (isPostgreSQL)");
        sb.AppendLine("                        {");
        sb.AppendLine("                            // For PostgreSQL, use text type");
        sb.AppendLine("                            property.SetColumnType(\"text\");");
        sb.AppendLine("                        }");
        sb.AppendLine("                        else");
        sb.AppendLine("                        {");
        sb.AppendLine("                            // For SQL Server, use nvarchar(max)");
        sb.AppendLine("                            property.SetColumnType(\"nvarchar(max)\");");
        sb.AppendLine("                        }");
        sb.AppendLine("                    }");
        sb.AppendLine("                }");
        sb.AppendLine("            }");
        sb.AppendLine("        }");
        sb.AppendLine("    }");
        sb.AppendLine("}");

        return sb.ToString();
    }
    
    static string Pluralize(string name)
    {
        if (string.IsNullOrEmpty(name))
            return name;
            
        // Handle special cases
        if (name.EndsWith("y") && !name.EndsWith("ay") && !name.EndsWith("ey") && !name.EndsWith("oy") && !name.EndsWith("uy"))
        {
            return name.Substring(0, name.Length - 1) + "ies";
        }
        else if (name.EndsWith("s") || name.EndsWith("ss") || name.EndsWith("sh") || name.EndsWith("ch") || name.EndsWith("x") || name.EndsWith("z"))
        {
            return name + "es";
        }
        else if (name == "Address")
        {
            return "Addresses";
        }
        else if (name.EndsWith("Data") || name.EndsWith("Info"))
        {
            return name; // Don't pluralize
        }
        else
        {
            return name + "s";
        }
    }
}