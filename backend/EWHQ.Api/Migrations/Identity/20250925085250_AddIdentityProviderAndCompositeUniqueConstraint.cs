using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EWHQ.Api.Migrations.Identity
{
    /// <inheritdoc />
    public partial class AddIdentityProviderAndCompositeUniqueConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Email_public",
                table: "Users");

            migrationBuilder.AddColumn<string>(
                name: "IdentityProvider",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE ""Users""
                SET ""IdentityProvider"" = SPLIT_PART(""Auth0UserId"", '|', 1)
                WHERE ""Auth0UserId"" IS NOT NULL;
            ");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email_IdentityProvider_public",
                table: "Users",
                columns: new[] { "Email", "IdentityProvider" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Email_IdentityProvider_public",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IdentityProvider",
                table: "Users");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email_public",
                table: "Users",
                column: "Email",
                unique: true);
        }
    }
}
