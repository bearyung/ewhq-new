using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using EWHQ.Api.Models.AdminPortal;
using EWHQ.Api.Services;
using EWHQ.Api.Identity;

namespace EWHQ.Api.Authorization;

/// <summary>
/// Attribute to require brand access with minimum role
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class RequireBrandAccessAttribute : Attribute, IAsyncActionFilter
{
    private readonly UserRole _minimumRole;
    private readonly bool _requireModifyPermission;
    private readonly string _brandIdParameterName;

    public RequireBrandAccessAttribute(
        UserRole minimumRole = UserRole.Viewer,
        bool requireModifyPermission = false,
        string brandIdParameterName = "brandId")
    {
        _minimumRole = minimumRole;
        _requireModifyPermission = requireModifyPermission;
        _brandIdParameterName = brandIdParameterName;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var authService = context.HttpContext.RequestServices.GetRequiredService<IBrandAuthorizationService>();
        var userContext = context.HttpContext.RequestServices.GetRequiredService<UserProfileDbContext>();

        // Get user ID from claims
        var userId = await context.HttpContext.User.GetUserIdAsync(userContext);
        if (string.IsNullOrEmpty(userId))
        {
            context.Result = new UnauthorizedObjectResult(new { message = "User not authenticated" });
            return;
        }

        // Get brand ID from route or query parameters
        if (!context.ActionArguments.TryGetValue(_brandIdParameterName, out var brandIdObj))
        {
            // Try to get from route values
            brandIdObj = context.RouteData.Values[_brandIdParameterName];
        }

        if (brandIdObj == null || !int.TryParse(brandIdObj.ToString(), out int brandId))
        {
            context.Result = new BadRequestObjectResult(new { message = "Brand ID not provided or invalid" });
            return;
        }

        // Check if user has access to the brand
        bool hasAccess;
        if (_requireModifyPermission)
        {
            hasAccess = await authService.UserCanModifyBrandDataAsync(userId, brandId);
        }
        else
        {
            hasAccess = await authService.UserHasAccessToBrandAsync(userId, brandId, _minimumRole);
        }

        if (!hasAccess)
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<RequireBrandAccessAttribute>>();
            logger.LogWarning("Access denied for user {UserId} to brand {BrandId}", userId, brandId);

            context.Result = new ForbidResult();
            return;
        }

        // Store brand ID in HttpContext for later use
        context.HttpContext.Items["VerifiedBrandId"] = brandId;
        context.HttpContext.Items["UserId"] = userId;

        await next();
    }
}

/// <summary>
/// Shorthand attributes for common scenarios
/// </summary>
public class RequireBrandOwnerAttribute : RequireBrandAccessAttribute
{
    public RequireBrandOwnerAttribute(string brandIdParameterName = "brandId")
        : base(UserRole.Owner, true, brandIdParameterName) { }
}

public class RequireBrandAdminAttribute : RequireBrandAccessAttribute
{
    public RequireBrandAdminAttribute(string brandIdParameterName = "brandId")
        : base(UserRole.BrandAdmin, true, brandIdParameterName) { }
}

public class RequireBrandModifyAttribute : RequireBrandAccessAttribute
{
    public RequireBrandModifyAttribute(string brandIdParameterName = "brandId")
        : base(UserRole.Manager, true, brandIdParameterName) { }
}

public class RequireBrandViewAttribute : RequireBrandAccessAttribute
{
    public RequireBrandViewAttribute(string brandIdParameterName = "brandId")
        : base(UserRole.Viewer, false, brandIdParameterName) { }
}