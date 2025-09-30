using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EWHQ.Api.Migrations.Identity
{
    /// <inheritdoc />
    public partial class ReplaceUserTenantWithUserAccess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserTenants",
                schema: "Identity");

            migrationBuilder.CreateTable(
                name: "UserAccesses",
                schema: "Identity",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    CompanyId = table.Column<int>(type: "integer", nullable: true),
                    AccountId = table.Column<int>(type: "integer", nullable: true),
                    ShopId = table.Column<int>(type: "integer", nullable: true),
                    Role = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAccesses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserAccesses_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "Identity",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserAccesses_AccountId",
                schema: "Identity",
                table: "UserAccesses",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAccesses_CompanyId",
                schema: "Identity",
                table: "UserAccesses",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAccesses_ShopId",
                schema: "Identity",
                table: "UserAccesses",
                column: "ShopId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAccesses_Unique_UserEntity",
                schema: "Identity",
                table: "UserAccesses",
                columns: new[] { "UserId", "CompanyId", "AccountId", "ShopId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserAccesses_UserId",
                schema: "Identity",
                table: "UserAccesses",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserAccesses",
                schema: "Identity");

            migrationBuilder.CreateTable(
                name: "UserTenants",
                schema: "Identity",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    AccountId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: true),
                    ShopId = table.Column<int>(type: "integer", nullable: true),
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
    }
}
