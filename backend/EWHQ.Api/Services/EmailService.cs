using SendGrid;
using SendGrid.Helpers.Mail;

namespace EWHQ.Api.Services;

public class EmailService : IEmailService
{
    private readonly ISendGridClient _sendGridClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(ISendGridClient sendGridClient, IConfiguration configuration, ILogger<EmailService> logger)
    {
        _sendGridClient = sendGridClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendTeamInvitationEmailAsync(string toEmail, string teamName, string inviterName, string invitationLink)
    {
        var subject = $"You've been invited to join {teamName}";
        
        var htmlContent = $@"
            <html>
            <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <h2 style='color: #4F46E5;'>Team Invitation</h2>
                    <p>Hi there,</p>
                    <p>{inviterName} has invited you to join the team <strong>{teamName}</strong> on EWHQ.</p>
                    <p>Click the button below to accept the invitation and join the team:</p>
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='{invitationLink}' 
                           style='background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                            Accept Invitation
                        </a>
                    </div>
                    <p>If you're unable to click the button, copy and paste this link into your browser:</p>
                    <p style='word-break: break-all; color: #666;'>{invitationLink}</p>
                    <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
                    <p style='font-size: 12px; color: #666;'>
                        This invitation was sent from EWHQ. If you didn't expect this invitation, you can safely ignore this email.
                    </p>
                </div>
            </body>
            </html>";

        var plainTextContent = $@"
Team Invitation

Hi there,

{inviterName} has invited you to join the team '{teamName}' on EWHQ.

To accept the invitation, visit this link:
{invitationLink}

This invitation was sent from EWHQ. If you didn't expect this invitation, you can safely ignore this email.
";

        return await SendEmailAsync(toEmail, subject, htmlContent, plainTextContent);
    }

    public async Task<bool> SendEmailVerificationAsync(string toEmail, string verificationCode, string teamName)
    {
        var subject = "Verify your email to join the team";

        var htmlContent = $@"
            <html>
            <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <h2 style='color: #4F46E5;'>Email Verification Required</h2>
                    <p>Hi there,</p>
                    <p>To complete your invitation to join <strong>{teamName}</strong>, please verify that you own this email address.</p>
                    <p>Your verification code is:</p>
                    <div style='text-align: center; margin: 30px 0;'>
                        <div style='background-color: #F3F4F6; padding: 20px; border-radius: 10px; display: inline-block;'>
                            <span style='font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5;'>{verificationCode}</span>
                        </div>
                    </div>
                    <p>Enter this code in the EWHQ application to complete your team invitation acceptance.</p>
                    <p style='color: #666;'>This code will expire in 30 minutes.</p>
                    <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
                    <p style='font-size: 12px; color: #666;'>
                        This verification was requested because you signed in with a different email address than the one invited.
                        If you didn't request this verification, you can safely ignore this email.
                    </p>
                </div>
            </body>
            </html>";

        var plainTextContent = $@"
Email Verification Required

Hi there,

To complete your invitation to join {teamName}, please verify that you own this email address.

Your verification code is: {verificationCode}

Enter this code in the EWHQ application to complete your team invitation acceptance.

This code will expire in 30 minutes.

This verification was requested because you signed in with a different email address than the one invited.
If you didn't request this verification, you can safely ignore this email.
";

        return await SendEmailAsync(toEmail, subject, htmlContent, plainTextContent);
    }

    public async Task<bool> SendEmailAsync(string toEmail, string subject, string htmlContent, string plainTextContent)
    {
        try
        {
            var apiKey = _configuration["SENDGRID_API_KEY"];
            if (string.IsNullOrWhiteSpace(apiKey) || apiKey == "your-sendgrid-api-key")
            {
                _logger.LogError("SendGrid API key is not configured properly. Please update SENDGRID_API_KEY in your .env file with a valid SendGrid API key.");
                return false;
            }

            var fromEmail = _configuration["SENDGRID_FROM_EMAIL"] ?? "noreply@ewhq.com";
            var fromName = _configuration["SENDGRID_FROM_NAME"] ?? "EWHQ Team";

            _logger.LogInformation($"Attempting to send email to {toEmail} from {fromEmail} with subject: {subject}");

            var from = new EmailAddress(fromEmail, fromName);
            var to = new EmailAddress(toEmail);
            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);

            var response = await _sendGridClient.SendEmailAsync(msg);

            if (response.StatusCode == System.Net.HttpStatusCode.OK || response.StatusCode == System.Net.HttpStatusCode.Accepted)
            {
                _logger.LogInformation($"Email sent successfully to {toEmail}. Status: {response.StatusCode}");
                return true;
            }
            else
            {
                var body = await response.Body.ReadAsStringAsync();
                _logger.LogError($"Failed to send email to {toEmail}. Status: {response.StatusCode}, Body: {body}");
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Exception occurred while sending email to {toEmail}");
            return false;
        }
    }
}