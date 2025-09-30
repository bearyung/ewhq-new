using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EWHQ.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddShopsToAdminPortal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccountMaster");

            migrationBuilder.DropTable(
                name: "Shop");

            migrationBuilder.CreateTable(
                name: "Shops",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BrandId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Address = table.Column<string>(type: "text", nullable: true),
                    City = table.Column<string>(type: "text", nullable: true),
                    State = table.Column<string>(type: "text", nullable: true),
                    Country = table.Column<string>(type: "text", nullable: true),
                    PostalCode = table.Column<string>(type: "text", nullable: true),
                    Latitude = table.Column<decimal>(type: "numeric", nullable: true),
                    Longitude = table.Column<decimal>(type: "numeric", nullable: true),
                    Phone = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    ContactName = table.Column<string>(type: "text", nullable: true),
                    ContactTitle = table.Column<string>(type: "text", nullable: true),
                    TimeZone = table.Column<string>(type: "text", nullable: true),
                    Currency = table.Column<string>(type: "text", nullable: true),
                    CurrencySymbol = table.Column<string>(type: "text", nullable: true),
                    BusinessRegistrationNumber = table.Column<string>(type: "text", nullable: true),
                    TaxId = table.Column<string>(type: "text", nullable: true),
                    ShopType = table.Column<string>(type: "text", nullable: true),
                    OpeningHours = table.Column<string>(type: "text", nullable: true),
                    IsOnlineOrderingEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeliveryEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    IsPickupEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    LegacyShopId = table.Column<int>(type: "integer", nullable: true),
                    LegacyAccountId = table.Column<int>(type: "integer", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shops", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Shops_Brands_BrandId",
                        column: x => x.BrandId,
                        principalTable: "Brands",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Shops_BrandId",
                table: "Shops",
                column: "BrandId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Shops");

            migrationBuilder.CreateTable(
                name: "AccountMaster",
                columns: table => new
                {
                    AccountId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AccountKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AccountName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    ModifiedBy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ModifiedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountMaster", x => x.AccountId);
                });

            migrationBuilder.CreateTable(
                name: "Shop",
                columns: table => new
                {
                    ShopId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AccountId = table.Column<int>(type: "integer", nullable: false),
                    AddressForDelivery = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    AddressLat = table.Column<decimal>(type: "numeric(10,7)", nullable: true),
                    AddressLine1 = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    AddressLine2 = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AddressLine3 = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AddressLine4 = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AddressLong = table.Column<decimal>(type: "numeric(10,7)", nullable: true),
                    AltAddressLine1 = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    AltAddressLine2 = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AltAddressLine3 = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AltAddressLine4 = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AltDesc = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    AltName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    BrandId = table.Column<int>(type: "integer", nullable: true),
                    City = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true),
                    Contact1 = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Contact2 = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ContactTitle1 = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ContactTitle2 = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Country = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CurrencyCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    CurrencySymbol = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Desc = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    District = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    Fax = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IntCallingCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    IsOclEnabled = table.Column<bool>(type: "boolean", nullable: true),
                    IsOnlineStore = table.Column<bool>(type: "boolean", nullable: true),
                    IsSuspended = table.Column<bool>(type: "boolean", nullable: true),
                    ModifiedBy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ModifiedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SelfOrderingBackgroundImagePath = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SelfOrderingBannerImagePath = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SelfOrderingDisclaimer = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SelfOrderingLogoImagePath = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SelfOrderingSplashImagePath = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ShopCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ShopGroupId = table.Column<int>(type: "integer", nullable: true),
                    ShopTypeId = table.Column<int>(type: "integer", nullable: false),
                    Telephone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TimeZoneId = table.Column<int>(type: "integer", nullable: true),
                    TimeZoneUseDaylightTime = table.Column<bool>(type: "boolean", nullable: true),
                    TimeZoneValue = table.Column<decimal>(type: "numeric(5,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shop", x => new { x.ShopId, x.AccountId });
                    table.ForeignKey(
                        name: "FK_Shop_Brands_BrandId",
                        column: x => x.BrandId,
                        principalTable: "Brands",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Shop_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Shop_BrandId",
                table: "Shop",
                column: "BrandId");

            migrationBuilder.CreateIndex(
                name: "IX_Shop_CompanyId",
                table: "Shop",
                column: "CompanyId");
        }
    }
}
