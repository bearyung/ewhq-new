using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EWHQ.Api.Data.Migrations.Admin
{
    /// <inheritdoc />
    public partial class FixTeamMemberUserIdMapping : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE ""TeamMembers"" tm
                SET ""UserId"" = u.""Id""
                FROM ""public"".""Users"" u
                WHERE tm.""UserId"" = u.""Auth0UserId""
                AND tm.""UserId"" LIKE '%|%';
            ");

            migrationBuilder.Sql(@"
                UPDATE ""TeamInvitations"" ti
                SET ""InvitedByUserId"" = u.""Id""
                FROM ""public"".""Users"" u
                WHERE ti.""InvitedByUserId"" = u.""Auth0UserId""
                AND ti.""InvitedByUserId"" LIKE '%|%';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
