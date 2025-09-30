using System.Net.Http.Headers;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace EWHQ.Api.Services;

public interface IAuth0ManagementService
{
    Task<string> GetManagementApiTokenAsync();
    Task<bool> UpdateUserProfileAsync(string auth0UserId, string firstName, string lastName);
    Task<string> InviteAdminUserAsync(string email, string firstName, string lastName, string role);
    Task<bool> UpdateUserMetadataAsync(string auth0UserId, object metadata);
}

public class Auth0ManagementService : IAuth0ManagementService
{
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<Auth0ManagementService> _logger;

    private string? _cachedToken;
    private DateTime _tokenExpiry = DateTime.MinValue;

    private readonly string _auth0Domain;

    public Auth0ManagementService(
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        ILogger<Auth0ManagementService> logger)
    {
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _auth0Domain = Environment.GetEnvironmentVariable("AUTH0_DOMAIN") ?? configuration["Auth0:Domain"] ?? "";
    }

    public async Task<string> GetManagementApiTokenAsync()
    {
        // Return cached token if still valid
        if (!string.IsNullOrEmpty(_cachedToken) && DateTime.UtcNow < _tokenExpiry.AddMinutes(-5))
        {
            return _cachedToken;
        }

        var auth0Domain = Environment.GetEnvironmentVariable("AUTH0_DOMAIN") ?? _configuration["Auth0:Domain"];
        var clientId = Environment.GetEnvironmentVariable("AUTH0_MANAGEMENT_API_ID") ?? _configuration["Auth0:ManagementApiId"];
        var clientSecret = Environment.GetEnvironmentVariable("AUTH0_MANAGEMENT_API_SECRET") ?? _configuration["Auth0:ManagementApiSecret"];

        if (string.IsNullOrEmpty(auth0Domain) || string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
        {
            throw new InvalidOperationException("Auth0 Management API credentials not configured");
        }

        var httpClient = _httpClientFactory.CreateClient();

        var tokenRequest = new
        {
            grant_type = "client_credentials",
            client_id = clientId,
            client_secret = clientSecret,
            audience = $"https://{auth0Domain}/api/v2/"
        };

        var content = new StringContent(JsonConvert.SerializeObject(tokenRequest), Encoding.UTF8, "application/json");
        var response = await httpClient.PostAsync($"https://{auth0Domain}/oauth/token", content);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            _logger.LogError($"Failed to get Auth0 Management API token: {response.StatusCode} - {error}");
            throw new Exception($"Failed to get Auth0 Management API token: {response.StatusCode}");
        }

        var responseContent = await response.Content.ReadAsStringAsync();
        dynamic tokenResponse = JsonConvert.DeserializeObject(responseContent);

        _cachedToken = tokenResponse.access_token;
        var expiresIn = (int)tokenResponse.expires_in;
        _tokenExpiry = DateTime.UtcNow.AddSeconds(expiresIn);

        return _cachedToken;
    }

    public async Task<bool> UpdateUserProfileAsync(string auth0UserId, string firstName, string lastName)
    {
        try
        {
            var auth0Domain = Environment.GetEnvironmentVariable("AUTH0_DOMAIN") ?? _configuration["Auth0:Domain"];
            var managementToken = await GetManagementApiTokenAsync();

            _logger.LogInformation($"Updating Auth0 profile for user {auth0UserId}");

            var httpClient = _httpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", managementToken);

            var fullName = $"{firstName} {lastName}".Trim();

            object updateRequest;

            if (!auth0UserId.StartsWith("google-oauth2|") && !auth0UserId.StartsWith("facebook|"))
            {
                updateRequest = new
                {
                    name = fullName,
                    given_name = firstName,
                    family_name = lastName,
                    user_metadata = new
                    {
                        first_name = firstName,
                        last_name = lastName,
                        full_name = fullName,
                        custom_profile = true
                    }
                };
            }
            else
            {
                updateRequest = new
                {
                    user_metadata = new
                    {
                        first_name = firstName,
                        last_name = lastName,
                        full_name = fullName,
                        custom_profile = true
                    }
                };
            }

            var jsonContent = JsonConvert.SerializeObject(updateRequest);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var url = $"https://{auth0Domain}/api/v2/users/{Uri.EscapeDataString(auth0UserId)}";

            var response = await httpClient.PatchAsync(url, content);

            if (!response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Failed to update Auth0 user profile for {auth0UserId}: {response.StatusCode} - {responseContent}");
                return false;
            }

            _logger.LogInformation($"Successfully updated Auth0 profile (user_metadata) for user {auth0UserId}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating Auth0 user profile for {auth0UserId}");
            return false;
        }
    }

    public async Task<string> InviteAdminUserAsync(string email, string firstName, string lastName, string role)
    {
        try
        {
            var managementToken = await GetManagementApiTokenAsync();
            var httpClient = _httpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", managementToken);

            var adminClientId = Environment.GetEnvironmentVariable("AUTH0_ADMIN_CLIENT_ID");
            var tempPassword = GenerateSecurePassword();

            var createUserRequest = new
            {
                email = email,
                password = tempPassword,
                connection = "Username-Password-Authentication",
                email_verified = false,
                given_name = firstName,
                family_name = lastName,
                name = $"{firstName} {lastName}".Trim(),
                app_metadata = new
                {
                    admin_portal_access = true,
                    authorized_applications = new[] { adminClientId },
                    roles = new[] { role },
                    invited_at = DateTime.UtcNow,
                    invited_by = "admin"
                }
            };

            var jsonContent = JsonConvert.SerializeObject(createUserRequest);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var response = await httpClient.PostAsync($"https://{_auth0Domain}/api/v2/users", content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Failed to create user: {response.StatusCode} - {errorContent}");
                throw new Exception($"Failed to create user: {errorContent}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var user = JsonConvert.DeserializeObject<JObject>(responseContent);
            var userId = user["user_id"]?.ToString();

            await SendPasswordResetEmailAsync(userId!);

            _logger.LogInformation($"Successfully invited admin user: {email}");
            return userId!;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error inviting admin user: {email}");
            throw;
        }
    }

    private async Task SendPasswordResetEmailAsync(string userId)
    {
        try
        {
            var managementToken = await GetManagementApiTokenAsync();
            var httpClient = _httpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", managementToken);

            var resetRequest = new { user_id = userId };
            var jsonContent = JsonConvert.SerializeObject(resetRequest);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var response = await httpClient.PostAsync($"https://{_auth0Domain}/api/v2/tickets/password-change", content);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation($"Password reset email sent to user: {userId}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, $"Failed to send password reset email to user: {userId}");
        }
    }

    private string GenerateSecurePassword()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
        var random = new Random();
        return new string(Enumerable.Range(0, 16)
            .Select(_ => chars[random.Next(chars.Length)])
            .ToArray());
    }

    public async Task<bool> UpdateUserMetadataAsync(string auth0UserId, object metadata)
    {
        try
        {
            var auth0Domain = Environment.GetEnvironmentVariable("AUTH0_DOMAIN") ?? _configuration["Auth0:Domain"];
            var managementToken = await GetManagementApiTokenAsync();

            _logger.LogInformation($"Updating Auth0 app_metadata for user {auth0UserId}");

            var httpClient = _httpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", managementToken);

            var updateRequest = new
            {
                app_metadata = metadata
            };

            var jsonContent = JsonConvert.SerializeObject(updateRequest);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var url = $"https://{auth0Domain}/api/v2/users/{Uri.EscapeDataString(auth0UserId)}";

            var response = await httpClient.PatchAsync(url, content);

            if (!response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Failed to update Auth0 app_metadata for {auth0UserId}: {response.StatusCode} - {responseContent}");
                return false;
            }

            _logger.LogInformation($"Successfully updated Auth0 app_metadata for user {auth0UserId}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating Auth0 app_metadata for {auth0UserId}");
            return false;
        }
    }
}