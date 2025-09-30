using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EWHQ.Api.Migrations.Identity
{
    /// <inheritdoc />
    public partial class RemoveUserAccessTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserAccesses",
                schema: "Identity");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserAccesses",
                schema: "Identity",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    AccessType = table.Column<string>(type: "text", nullable: false),
                    AccountId = table.Column<int>(type: "integer", nullable: true),
                    CompanyId = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    DistributorId = table.Column<string>(type: "text", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    RegionCode = table.Column<string>(type: "text", nullable: true),
                    ResellerId = table.Column<string>(type: "text", nullable: true),
                    Role = table.Column<string>(type: "text", nullable: false),
                    ShopId = table.Column<int>(type: "integer", nullable: true),
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
    }
}
