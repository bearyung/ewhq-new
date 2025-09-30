namespace EWHQ.Api.Services;

public interface IEmailService
{
    Task<bool> SendTeamInvitationEmailAsync(string toEmail, string teamName, string inviterName, string invitationLink);
    Task<bool> SendEmailAsync(string toEmail, string subject, string htmlContent, string plainTextContent);
    Task<bool> SendEmailVerificationAsync(string toEmail, string verificationCode, string teamName);
}