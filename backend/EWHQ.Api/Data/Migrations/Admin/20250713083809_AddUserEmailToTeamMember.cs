using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EWHQ.Api.Data.Migrations.Admin
{
    /// <inheritdoc />
    public partial class AddUserEmailToTeamMember : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserEmail",
                table: "TeamMembers",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserEmail",
                table: "TeamMembers");
        }
    }
}
