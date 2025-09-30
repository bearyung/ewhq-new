using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EWHQ.Api.Data.Migrations.Admin
{
    /// <inheritdoc />
    public partial class UpdateRegionTerritoryHierarchy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DistributorUserId",
                table: "Territories",
                newName: "ResellerUserId");

            migrationBuilder.AddColumn<string>(
                name: "DistributorProfileUserId",
                table: "Regions",
                type: "character varying(450)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DistributorUserId",
                table: "Regions",
                type: "character varying(450)",
                maxLength: 450,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Regions_DistributorProfileUserId",
                table: "Regions",
                column: "DistributorProfileUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Regions_DistributorProfiles_DistributorProfileUserId",
                table: "Regions",
                column: "DistributorProfileUserId",
                principalTable: "DistributorProfiles",
                principalColumn: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Regions_DistributorProfiles_DistributorProfileUserId",
                table: "Regions");

            migrationBuilder.DropIndex(
                name: "IX_Regions_DistributorProfileUserId",
                table: "Regions");

            migrationBuilder.DropColumn(
                name: "DistributorProfileUserId",
                table: "Regions");

            migrationBuilder.DropColumn(
                name: "DistributorUserId",
                table: "Regions");

            migrationBuilder.RenameColumn(
                name: "ResellerUserId",
                table: "Territories",
                newName: "DistributorUserId");
        }
    }
}
