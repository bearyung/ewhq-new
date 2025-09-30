using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EWHQ.Api.Migrations.Identity
{
    /// <inheritdoc />
    public partial class AddBackOfficeHierarchyToUserAccess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AccessType",
                schema: "Identity",
                table: "UserAccesses",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DistributorId",
                schema: "Identity",
                table: "UserAccesses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDefault",
                schema: "Identity",
                table: "UserAccesses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "RegionCode",
                schema: "Identity",
                table: "UserAccesses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResellerId",
                schema: "Identity",
                table: "UserAccesses",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccessType",
                schema: "Identity",
                table: "UserAccesses");

            migrationBuilder.DropColumn(
                name: "DistributorId",
                schema: "Identity",
                table: "UserAccesses");

            migrationBuilder.DropColumn(
                name: "IsDefault",
                schema: "Identity",
                table: "UserAccesses");

            migrationBuilder.DropColumn(
                name: "RegionCode",
                schema: "Identity",
                table: "UserAccesses");

            migrationBuilder.DropColumn(
                name: "ResellerId",
                schema: "Identity",
                table: "UserAccesses");
        }
    }
}
