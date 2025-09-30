using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EWHQ.Api.Data.Migrations.Admin
{
    /// <inheritdoc />
    public partial class RenameInvitedByToInvitedByUserId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "InvitedBy",
                table: "TeamMembers",
                newName: "InvitedByUserId");

            migrationBuilder.RenameColumn(
                name: "InvitedBy",
                table: "TeamInvitations",
                newName: "InvitedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "InvitedByUserId",
                table: "TeamMembers",
                newName: "InvitedBy");

            migrationBuilder.RenameColumn(
                name: "InvitedByUserId",
                table: "TeamInvitations",
                newName: "InvitedBy");
        }
    }
}
