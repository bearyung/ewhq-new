using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EWHQ.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLegacyPOSFieldsToBrand : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LegacyAccountId",
                table: "Brands",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "UseLegacyPOS",
                table: "Brands",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LegacyAccountId",
                table: "Brands");

            migrationBuilder.DropColumn(
                name: "UseLegacyPOS",
                table: "Brands");
        }
    }
}
