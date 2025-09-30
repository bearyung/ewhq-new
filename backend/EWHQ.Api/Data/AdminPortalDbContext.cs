using Microsoft.EntityFrameworkCore;
using EWHQ.Api.Models.AdminPortal;
using EWHQ.Api.Data.Attributes;
using System.Reflection;
using System.ComponentModel.DataAnnotations;

namespace EWHQ.Api.Data;

public class AdminPortalDbContext : DbContext
{
    public AdminPortalDbContext(DbContextOptions<AdminPortalDbContext> options) : base(options)
    {
    }

    // Core entities for Admin Portal
    public DbSet<Company> Companies { get; set; }
    public DbSet<Brand> Brands { get; set; }
    public DbSet<Shop> Shops { get; set; }

    // User relationship entities
    public DbSet<UserCompany> UserCompanies { get; set; }
    public DbSet<UserBrand> UserBrands { get; set; }
    public DbSet<UserShop> UserShops { get; set; }
    // public DbSet<User> Users { get; set; }
    // public DbSet<Department> Departments { get; set; }
    // public DbSet<ItemCategory> ItemCategories { get; set; }
    // public DbSet<ItemMaster> ItemMasters { get; set; }
    
    // Transaction entities
    // public DbSet<TxSalesHeader> TxSalesHeaders { get; set; }
    // public DbSet<TxSalesDetail> TxSalesDetails { get; set; }
    // public DbSet<TxPayment> TxPayments { get; set; }
    
    // Member entities
    // public DbSet<MemberHeader> MemberHeaders { get; set; }
    // public DbSet<MemberDetail> MemberDetails { get; set; }
    
    // Stock entities
    // public DbSet<StockLevelShopDetail> StockLevelShopDetails { get; set; }
    // public DbSet<StockOrderHeader> StockOrderHeaders { get; set; }
    // public DbSet<StockTakeHeader> StockTakeHeaders { get; set; }
    
    // Add more DbSets as needed for other entities

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure composite keys where needed
        // modelBuilder.Entity<User>()
        //     .HasKey(u => new { u.UserId, u.AccountId, u.ShopId });

        // modelBuilder.Entity<Department>()
        //     .HasKey(d => new { d.DepartmentId, d.AccountId });

        // modelBuilder.Entity<ItemCategory>()
        //     .HasKey(ic => new { ic.CategoryId, ic.AccountId });

        // modelBuilder.Entity<ItemMaster>()
        //     .HasKey(im => new { im.ItemId, im.AccountId });

        // modelBuilder.Entity<MemberHeader>()
        //     .HasKey(mh => new { mh.MemberHeaderId, mh.AccountId });

        // modelBuilder.Entity<MemberDetail>()
        //     .HasKey(md => new { md.MemberDetailId, md.AccountId, md.ShopId });

        // modelBuilder.Entity<StockOrderHeader>()
        //     .HasKey(soh => new { soh.OrderHeaderId, soh.AccountId });

        // modelBuilder.Entity<StockTakeHeader>()
        //     .HasKey(sth => new { sth.StockTakeHeaderId, sth.AccountId, sth.ShopId });

        // modelBuilder.Entity<TxSalesHeader>()
        //     .HasKey(tsh => new { tsh.TxSalesHeaderId, tsh.AccountId, tsh.ShopId });

        // modelBuilder.Entity<TxSalesDetail>()
        //     .HasKey(tsd => new { tsd.TxSalesDetailId, tsd.AccountId, tsd.ShopId });

        // modelBuilder.Entity<TxPayment>()
        //     .HasKey(tp => new { tp.TxPaymentId, tp.AccountId, tp.ShopId });

        // modelBuilder.Entity<StockLevelShopDetail>()
        //     .HasKey(sl => new { sl.AccountId, sl.ShopId, sl.RawMaterialId });

        // Configure relationships for new entities
        modelBuilder.Entity<Brand>()
            .HasOne(b => b.Company)
            .WithMany(c => c.Brands)
            .HasForeignKey(b => b.CompanyId);

        modelBuilder.Entity<Shop>()
            .HasOne(s => s.Brand)
            .WithMany(b => b.Shops)
            .HasForeignKey(s => s.BrandId);

        // Configure UserCompany relationships
        modelBuilder.Entity<UserCompany>()
            .HasOne(uc => uc.Company)
            .WithMany(c => c.UserCompanies)
            .HasForeignKey(uc => uc.CompanyId);

        // Configure UserBrand relationships
        modelBuilder.Entity<UserBrand>()
            .HasOne(ub => ub.Brand)
            .WithMany(b => b.UserBrands)
            .HasForeignKey(ub => ub.BrandId);

        // Configure UserShop relationships
        modelBuilder.Entity<UserShop>()
            .HasOne(us => us.Shop)
            .WithMany(s => s.UserShops)
            .HasForeignKey(us => us.ShopId);

        // No foreign key relationships configured for legacy entities - pure table mapping
        
        // Apply database-specific configurations
        ApplyDatabaseSpecificConfigurations(modelBuilder);
    }
    
    private void ApplyDatabaseSpecificConfigurations(ModelBuilder modelBuilder)
    {
        var isPostgreSQL = Database.IsNpgsql();
        
        // Configure string properties with MaxLengthUnlimited attribute
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.PropertyInfo != null)
                {
                    var maxLengthAttr = property.PropertyInfo.GetCustomAttribute<MaxLengthAttribute>();
                    if (maxLengthAttr is MaxLengthUnlimitedAttribute)
                    {
                        if (isPostgreSQL)
                        {
                            // For PostgreSQL, use text type
                            property.SetColumnType("text");
                        }
                        else
                        {
                            // For SQL Server, use nvarchar(max)
                            property.SetColumnType("nvarchar(max)");
                        }
                    }
                }
            }
        }
    }
}