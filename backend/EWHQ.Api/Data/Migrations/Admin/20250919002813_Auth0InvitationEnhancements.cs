using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EWHQ.Api.Data.Migrations.Admin
{
    /// <inheritdoc />
    public partial class Auth0InvitationEnhancements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "RequiresEmailVerification",
                table: "TeamInvitations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "VerificationAttempts",
                table: "TeamInvitations",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "VerificationCode",
                table: "TeamInvitations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "VerificationCodeExpiresAt",
                table: "TeamInvitations",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RequiresEmailVerification",
                table: "TeamInvitations");

            migrationBuilder.DropColumn(
                name: "VerificationAttempts",
                table: "TeamInvitations");

            migrationBuilder.DropColumn(
                name: "VerificationCode",
                table: "TeamInvitations");

            migrationBuilder.DropColumn(
                name: "VerificationCodeExpiresAt",
                table: "TeamInvitations");
        }
    }
}
