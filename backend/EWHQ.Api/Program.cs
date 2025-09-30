using Microsoft.EntityFrameworkCore;
using EWHQ.Api.Data;
using DotNetEnv;
using EWHQ.Api.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using EWHQ.Api.Services;
using SendGrid;

// Load environment variables from .env file
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Determine database provider from environment variable
var dbProviderString = Environment.GetEnvironmentVariable("DB_PROVIDER") ?? "SqlServer";
if (!Enum.TryParse<DatabaseProvider>(dbProviderString, out var dbProvider))
{
    throw new InvalidOperationException($"Invalid database provider: {dbProviderString}. Valid values are: SqlServer, PostgreSQL");
}

// Create database configuration based on provider
IDatabaseConfiguration mainDbConfig;
IDatabaseConfiguration adminDbConfig;

if (dbProvider == DatabaseProvider.SqlServer)
{
    // SQL Server configuration
    var mainDbParams = new Dictionary<string, string>
    {
        ["Server"] = Environment.GetEnvironmentVariable("DB_SERVER") ?? throw new InvalidOperationException("DB_SERVER not set"),
        ["Database"] = Environment.GetEnvironmentVariable("DB_NAME") ?? throw new InvalidOperationException("DB_NAME not set"),
        ["UserId"] = Environment.GetEnvironmentVariable("DB_USER") ?? throw new InvalidOperationException("DB_USER not set"),
        ["Password"] = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? throw new InvalidOperationException("DB_PASSWORD not set"),
        ["ConnectionTimeout"] = Environment.GetEnvironmentVariable("DB_CONNECTION_TIMEOUT") ?? "30",
        ["MaxPoolSize"] = Environment.GetEnvironmentVariable("DB_MAX_POOL_SIZE") ?? "100",
        ["MinPoolSize"] = Environment.GetEnvironmentVariable("DB_MIN_POOL_SIZE") ?? "5"
    };
    
    var adminDbParams = new Dictionary<string, string>
    {
        ["Server"] = Environment.GetEnvironmentVariable("ADMIN_DB_SERVER") ?? mainDbParams["Server"],
        ["Database"] = Environment.GetEnvironmentVariable("ADMIN_DB_NAME") ?? throw new InvalidOperationException("ADMIN_DB_NAME not set"),
        ["UserId"] = Environment.GetEnvironmentVariable("ADMIN_DB_USER") ?? mainDbParams["UserId"],
        ["Password"] = Environment.GetEnvironmentVariable("ADMIN_DB_PASSWORD") ?? mainDbParams["Password"],
        ["ConnectionTimeout"] = mainDbParams["ConnectionTimeout"],
        ["MaxPoolSize"] = mainDbParams["MaxPoolSize"],
        ["MinPoolSize"] = mainDbParams["MinPoolSize"]
    };
    
    mainDbConfig = DatabaseConfigurationFactory.Create(DatabaseProvider.SqlServer, mainDbParams);
    adminDbConfig = DatabaseConfigurationFactory.Create(DatabaseProvider.SqlServer, adminDbParams);
}
else // PostgreSQL
{
    // PostgreSQL configuration
    var mainDbParams = new Dictionary<string, string>
    {
        ["Host"] = Environment.GetEnvironmentVariable("DB_HOST") ?? Environment.GetEnvironmentVariable("DB_SERVER") ?? throw new InvalidOperationException("DB_HOST not set"),
        ["Database"] = Environment.GetEnvironmentVariable("DB_NAME") ?? throw new InvalidOperationException("DB_NAME not set"),
        ["Username"] = Environment.GetEnvironmentVariable("DB_USER") ?? throw new InvalidOperationException("DB_USER not set"),
        ["Password"] = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? throw new InvalidOperationException("DB_PASSWORD not set"),
        ["Port"] = Environment.GetEnvironmentVariable("DB_PORT") ?? "5432",
        ["ConnectionTimeout"] = Environment.GetEnvironmentVariable("DB_CONNECTION_TIMEOUT") ?? "30",
        ["MaxPoolSize"] = Environment.GetEnvironmentVariable("DB_MAX_POOL_SIZE") ?? "100",
        ["MinPoolSize"] = Environment.GetEnvironmentVariable("DB_MIN_POOL_SIZE") ?? "5",
        ["SslMode"] = Environment.GetEnvironmentVariable("DB_SSL_MODE") ?? "Require",
        ["ChannelBinding"] = Environment.GetEnvironmentVariable("DB_CHANNEL_BINDING") ?? "Prefer"
    };
    
    var adminDbParams = new Dictionary<string, string>
    {
        ["Host"] = Environment.GetEnvironmentVariable("ADMIN_DB_HOST") ?? Environment.GetEnvironmentVariable("ADMIN_DB_SERVER") ?? mainDbParams["Host"],
        ["Database"] = Environment.GetEnvironmentVariable("ADMIN_DB_NAME") ?? throw new InvalidOperationException("ADMIN_DB_NAME not set"),
        ["Username"] = Environment.GetEnvironmentVariable("ADMIN_DB_USER") ?? mainDbParams["Username"],
        ["Password"] = Environment.GetEnvironmentVariable("ADMIN_DB_PASSWORD") ?? mainDbParams["Password"],
        ["Port"] = Environment.GetEnvironmentVariable("ADMIN_DB_PORT") ?? mainDbParams["Port"],
        ["ConnectionTimeout"] = mainDbParams["ConnectionTimeout"],
        ["MaxPoolSize"] = mainDbParams["MaxPoolSize"],
        ["MinPoolSize"] = mainDbParams["MinPoolSize"],
        ["SslMode"] = Environment.GetEnvironmentVariable("ADMIN_DB_SSL_MODE") ?? mainDbParams["SslMode"],
        ["ChannelBinding"] = Environment.GetEnvironmentVariable("ADMIN_DB_CHANNEL_BINDING") ?? mainDbParams["ChannelBinding"]
    };
    
    mainDbConfig = DatabaseConfigurationFactory.Create(DatabaseProvider.PostgreSQL, mainDbParams);
    adminDbConfig = DatabaseConfigurationFactory.Create(DatabaseProvider.PostgreSQL, adminDbParams);
}

// Add Entity Framework Core with provider-specific configuration
builder.Services.AddDbContext<AdminPortalDbContext>(options =>
    adminDbConfig.ConfigureDbContext(options, adminDbConfig.BuildConnectionString()));

// Add User Profile DbContext (consolidated into Admin database)
builder.Services.AddDbContext<UserProfileDbContext>(options =>
    adminDbConfig.ConfigureDbContext(options, adminDbConfig.BuildConnectionString()));

// Add Admin DbContext with provider-specific configuration  
builder.Services.AddDbContext<AdminDbContext>(options =>
    adminDbConfig.ConfigureDbContext(options, adminDbConfig.BuildConnectionString()));

// Add EWHQ Portal DbContext with provider-specific configuration
builder.Services.AddDbContext<EWHQDbContext>(options =>
    mainDbConfig.ConfigureDbContext(options, mainDbConfig.BuildConnectionString()));

// Add POS DbContext service for managing legacy and new POS databases
builder.Services.AddScoped<IPOSDbContextService, POSDbContextService>();

// Add Brand Authorization service
builder.Services.AddScoped<IBrandAuthorizationService, BrandAuthorizationService>();

// Identity services removed - Auth0 handles all authentication
// UserProfileDbContext now manages user profiles directly

// Configure Auth0 JWT authentication
var auth0Domain = Environment.GetEnvironmentVariable("AUTH0_DOMAIN") ?? throw new InvalidOperationException("AUTH0_DOMAIN not set");
var auth0Audience = Environment.GetEnvironmentVariable("AUTH0_AUDIENCE") ?? throw new InvalidOperationException("AUTH0_AUDIENCE not set");

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://{auth0Domain}/";
        options.Audience = auth0Audience;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.Zero,
            NameClaimType = ClaimTypes.NameIdentifier,
            RoleClaimType = "https://ewhq.com/roles"
        };
    });

// Add authorization
builder.Services.AddAuthorization();

// Add custom services
// DatabaseSeeder removed - Auth0 handles user authentication
builder.Services.AddScoped<ICompanyService, CompanyService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();

// Add Admin services
builder.Services.AddScoped<ITeamService, TeamService>();
builder.Services.AddScoped<AdminDatabaseSeeder>();

// Add Email service
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddSingleton<ISendGridClient>(x =>
    new SendGridClient(Environment.GetEnvironmentVariable("SENDGRID_API_KEY") ?? throw new InvalidOperationException("SENDGRID_API_KEY not set")));

// Add Auth0 Management service
builder.Services.AddScoped<IAuth0ManagementService, Auth0ManagementService>();

// Add Legacy POS Service
builder.Services.AddScoped<ILegacyPOSService, LegacyPOSService>();

// Add HttpClient for Auth0 controller
builder.Services.AddHttpClient();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder =>
        {
            builder.WithOrigins("http://localhost:5173", "http://localhost:5174") // Both frontend ports
                   .AllowAnyMethod()
                   .AllowAnyHeader()
                   .AllowCredentials();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Handle CLI commands
if (args.Length > 0)
{
    if (args[0] == "seed-teams")
    {
        await SeedSampleTeams(app);
        return; // Exit after seeding
    }
}

app.Run();

// CLI command handler for seeding sample teams
async Task SeedSampleTeams(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var seeder = scope.ServiceProvider.GetRequiredService<AdminDatabaseSeeder>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    Console.WriteLine("Seeding sample teams...");
    
    // Check if --force flag is provided
    bool forceClear = args.Length > 1 && args[1] == "--force";
    
    var success = await seeder.SeedSampleTeamsAsync(forceClear);
    
    if (success)
    {
        Console.WriteLine("\n✅ Successfully seeded sample teams!");
        Console.WriteLine("\nYou can now access the Teams management page in the admin portal.");
    }
    else
    {
        Console.WriteLine("\n❌ Failed to seed teams. Check the logs for details.");
    }
}
