using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EWHQ.Api.Migrations.Identity
{
    /// <inheritdoc />
    public partial class AddMultiTenancySupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccountId",
                schema: "Identity",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ShopId",
                schema: "Identity",
                table: "Users");

            migrationBuilder.AddColumn<string>(
                name: "CompanyName",
                schema: "Identity",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompanyRegistrationNumber",
                schema: "Identity",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastLoginAt",
                schema: "Identity",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserType",
                schema: "Identity",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "UserTenants",
                schema: "Identity",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    AccountId = table.Column<int>(type: "integer", nullable: false),
                    ShopId = table.Column<int>(type: "integer", nullable: true),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTenants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserTenants_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Identity",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_AccountId",
                schema: "Identity",
                table: "UserTenants",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_User_Account_Shop",
                schema: "Identity",
                table: "UserTenants",
                columns: new[] { "UserId", "AccountId", "ShopId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_UserId",
                schema: "Identity",
                table: "UserTenants",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserTenants",
                schema: "Identity");

            migrationBuilder.DropColumn(
                name: "CompanyName",
                schema: "Identity",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CompanyRegistrationNumber",
                schema: "Identity",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LastLoginAt",
                schema: "Identity",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UserType",
                schema: "Identity",
                table: "Users");

            migrationBuilder.AddColumn<int>(
                name: "AccountId",
                schema: "Identity",
                table: "Users",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ShopId",
                schema: "Identity",
                table: "Users",
                type: "integer",
                nullable: true);
        }
    }
}
