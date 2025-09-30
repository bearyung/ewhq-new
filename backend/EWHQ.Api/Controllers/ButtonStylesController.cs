using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using EWHQ.Api.DTOs;
using EWHQ.Api.Models.Entities;
using EWHQ.Api.Services;
using EWHQ.Api.Authorization;
using System.Security.Claims;

namespace EWHQ.Api.Controllers;

[ApiController]
[Route("api/button-styles")]
[Authorize]
public class ButtonStylesController : ControllerBase
{
    private readonly IPOSDbContextService _posContextService;
    private readonly ILogger<ButtonStylesController> _logger;

    public ButtonStylesController(
        IPOSDbContextService posContextService,
        ILogger<ButtonStylesController> logger)
    {
        _posContextService = posContextService;
        _logger = logger;
    }

    [HttpGet("brand/{brandId}")]
    [RequireBrandView] // Viewer role or higher can view button styles
    public async Task<ActionResult<IEnumerable<ButtonStyleDto>>> GetButtonStyles(int brandId)
    {
        try
        {
            var (context, accountId) = await _posContextService.GetContextAndAccountIdForBrandAsync(brandId);

            var buttonStyles = await context.ButtonStyleMasters
                .Where(bs => bs.AccountId == accountId && bs.IsSystemUse != true && bs.Enabled != false)
                .Select(bs => new ButtonStyleDto
                {
                    ButtonStyleId = bs.ButtonStyleId,
                    AccountId = bs.AccountId,
                    StyleName = bs.StyleName ?? string.Empty,
                    StyleNameAlt = bs.StyleNameAlt,
                    ResourceStyleName = bs.ResourceStyleName,
                    BackgroundColorTop = bs.BackgroundColorTop,
                    BackgroundColorMiddle = bs.BackgroundColorMiddle,
                    BackgroundColorBottom = bs.BackgroundColorBottom,
                    Enabled = bs.Enabled,
                    FontSize = bs.FontSize,
                    Width = bs.Width,
                    Height = bs.Height,
                    ImageModeWidth = bs.ImageModeWidth,
                    ImageModeHeight = bs.ImageModeHeight,
                    ImageModeFontSize = bs.ImageModeFontSize,
                    ImageModeResourceStyleName = bs.ImageModeResourceStyleName,
                    IsSystemUse = bs.IsSystemUse,
                    CreatedDate = bs.CreatedDate,
                    CreatedBy = bs.CreatedBy,
                    ModifiedDate = bs.ModifiedDate,
                    ModifiedBy = bs.ModifiedBy,
                })
                .ToListAsync();

            return Ok(buttonStyles);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Brand not found: {BrandId}", brandId);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching button styles for brand {BrandId}", brandId);
            return StatusCode(500, new { message = "An error occurred while fetching button styles" });
        }
    }

    [HttpGet("brand/{brandId}/{buttonStyleId}")]
    [RequireBrandView] // Viewer role or higher can view button styles
    public async Task<ActionResult<ButtonStyleDto>> GetButtonStyle(int brandId, int buttonStyleId)
    {
        try
        {
            var (context, accountId) = await _posContextService.GetContextAndAccountIdForBrandAsync(brandId);

            var buttonStyle = await context.ButtonStyleMasters
                .FirstOrDefaultAsync(bs => bs.ButtonStyleId == buttonStyleId && bs.AccountId == accountId);

            if (buttonStyle == null)
            {
                return NotFound(new { message = "Button style not found" });
            }

            var dto = new ButtonStyleDto
            {
                ButtonStyleId = buttonStyle.ButtonStyleId,
                AccountId = buttonStyle.AccountId,
                StyleName = buttonStyle.StyleName ?? string.Empty,
                StyleNameAlt = buttonStyle.StyleNameAlt,
                ResourceStyleName = buttonStyle.ResourceStyleName,
                BackgroundColorTop = buttonStyle.BackgroundColorTop,
                BackgroundColorMiddle = buttonStyle.BackgroundColorMiddle,
                BackgroundColorBottom = buttonStyle.BackgroundColorBottom,
                Enabled = buttonStyle.Enabled,
                FontSize = buttonStyle.FontSize,
                Width = buttonStyle.Width,
                Height = buttonStyle.Height,
                ImageModeWidth = buttonStyle.ImageModeWidth,
                ImageModeHeight = buttonStyle.ImageModeHeight,
                ImageModeFontSize = buttonStyle.ImageModeFontSize,
                ImageModeResourceStyleName = buttonStyle.ImageModeResourceStyleName,
                IsSystemUse = buttonStyle.IsSystemUse,
                CreatedDate = buttonStyle.CreatedDate,
                CreatedBy = buttonStyle.CreatedBy,
                ModifiedDate = buttonStyle.ModifiedDate,
                ModifiedBy = buttonStyle.ModifiedBy
            };

            return Ok(dto);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Brand not found: {BrandId}", brandId);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching button style {ButtonStyleId} for brand {BrandId}", buttonStyleId, brandId);
            return StatusCode(500, new { message = "An error occurred while fetching the button style" });
        }
    }

    [HttpPost("brand/{brandId}")]
    [RequireBrandModify] // Only Brand Admin/Owner can create button styles
    public async Task<ActionResult<ButtonStyleDto>> CreateButtonStyle(int brandId, CreateButtonStyleDto createDto)
    {
        try
        {
            var (context, accountId) = await _posContextService.GetContextAndAccountIdForBrandAsync(brandId);

            // Get next ButtonStyleId for this account
            var maxId = await context.ButtonStyleMasters
                .Where(bs => bs.AccountId == accountId)
                .MaxAsync(bs => (int?)bs.ButtonStyleId) ?? 0;

            var buttonStyle = new ButtonStyleMaster
            {
                ButtonStyleId = maxId + 1,
                AccountId = accountId,
                StyleName = createDto.StyleName,
                StyleNameAlt = createDto.StyleNameAlt,
                ResourceStyleName = createDto.ResourceStyleName,
                BackgroundColorTop = createDto.BackgroundColorTop,
                BackgroundColorMiddle = createDto.BackgroundColorMiddle,
                BackgroundColorBottom = createDto.BackgroundColorBottom,
                Enabled = createDto.Enabled,
                FontSize = createDto.FontSize,
                Width = createDto.Width,
                Height = createDto.Height,
                ImageModeWidth = createDto.ImageModeWidth,
                ImageModeHeight = createDto.ImageModeHeight,
                ImageModeFontSize = createDto.ImageModeFontSize,
                ImageModeResourceStyleName = createDto.ImageModeResourceStyleName,
                IsSystemUse = false,
                CreatedDate = DateTime.UtcNow,
                CreatedBy = User.FindFirst(ClaimTypes.Email)?.Value ?? "System"
            };

            context.ButtonStyleMasters.Add(buttonStyle);
            await context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetButtonStyle),
                new { brandId, buttonStyleId = buttonStyle.ButtonStyleId },
                new ButtonStyleDto
                {
                    ButtonStyleId = buttonStyle.ButtonStyleId,
                    AccountId = buttonStyle.AccountId,
                    StyleName = buttonStyle.StyleName ?? string.Empty,
                    StyleNameAlt = buttonStyle.StyleNameAlt,
                    ResourceStyleName = buttonStyle.ResourceStyleName,
                    BackgroundColorTop = buttonStyle.BackgroundColorTop,
                    BackgroundColorMiddle = buttonStyle.BackgroundColorMiddle,
                    BackgroundColorBottom = buttonStyle.BackgroundColorBottom,
                    Enabled = buttonStyle.Enabled,
                    FontSize = buttonStyle.FontSize,
                    Width = buttonStyle.Width,
                    Height = buttonStyle.Height,
                    ImageModeWidth = buttonStyle.ImageModeWidth,
                    ImageModeHeight = buttonStyle.ImageModeHeight,
                    ImageModeFontSize = buttonStyle.ImageModeFontSize,
                    ImageModeResourceStyleName = buttonStyle.ImageModeResourceStyleName,
                    IsSystemUse = buttonStyle.IsSystemUse,
                    CreatedDate = buttonStyle.CreatedDate,
                    CreatedBy = buttonStyle.CreatedBy
                });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Brand not found: {BrandId}", brandId);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating button style for brand {BrandId}", brandId);
            return StatusCode(500, new { message = "An error occurred while creating the button style" });
        }
    }

    [HttpPut("brand/{brandId}/{buttonStyleId}")]
    [RequireBrandModify] // Only Brand Admin/Owner can update button styles
    public async Task<ActionResult> UpdateButtonStyle(int brandId, int buttonStyleId, UpdateButtonStyleDto updateDto)
    {
        try
        {
            var (context, accountId) = await _posContextService.GetContextAndAccountIdForBrandAsync(brandId);

            var buttonStyle = await context.ButtonStyleMasters
                .FirstOrDefaultAsync(bs => bs.ButtonStyleId == buttonStyleId && bs.AccountId == accountId);

            if (buttonStyle == null)
            {
                return NotFound(new { message = "Button style not found" });
            }

            // Don't allow updating system-use button styles
            if (buttonStyle.IsSystemUse == true)
            {
                return BadRequest(new { message = "Cannot modify system button styles" });
            }

            buttonStyle.StyleName = updateDto.StyleName;
            buttonStyle.StyleNameAlt = updateDto.StyleNameAlt;
            buttonStyle.ResourceStyleName = updateDto.ResourceStyleName;
            buttonStyle.BackgroundColorTop = updateDto.BackgroundColorTop;
            buttonStyle.BackgroundColorMiddle = updateDto.BackgroundColorMiddle;
            buttonStyle.BackgroundColorBottom = updateDto.BackgroundColorBottom;
            buttonStyle.Enabled = updateDto.Enabled;
            buttonStyle.FontSize = updateDto.FontSize;
            buttonStyle.Width = updateDto.Width;
            buttonStyle.Height = updateDto.Height;
            buttonStyle.ImageModeWidth = updateDto.ImageModeWidth;
            buttonStyle.ImageModeHeight = updateDto.ImageModeHeight;
            buttonStyle.ImageModeFontSize = updateDto.ImageModeFontSize;
            buttonStyle.ImageModeResourceStyleName = updateDto.ImageModeResourceStyleName;
            buttonStyle.ModifiedDate = DateTime.UtcNow;
            buttonStyle.ModifiedBy = User.FindFirst(ClaimTypes.Email)?.Value ?? "System";

            await context.SaveChangesAsync();

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Brand not found: {BrandId}", brandId);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating button style {ButtonStyleId} for brand {BrandId}", buttonStyleId, brandId);
            return StatusCode(500, new { message = "An error occurred while updating the button style" });
        }
    }

    [HttpDelete("brand/{brandId}/{buttonStyleId}")]
    [RequireBrandModify] // Only Brand Admin/Owner can delete button styles
    public async Task<ActionResult> DeleteButtonStyle(int brandId, int buttonStyleId)
    {
        try
        {
            var (context, accountId) = await _posContextService.GetContextAndAccountIdForBrandAsync(brandId);

            var buttonStyle = await context.ButtonStyleMasters
                .FirstOrDefaultAsync(bs => bs.ButtonStyleId == buttonStyleId && bs.AccountId == accountId);

            if (buttonStyle == null)
            {
                return NotFound(new { message = "Button style not found" });
            }

            // Don't allow deleting system-use button styles
            if (buttonStyle.IsSystemUse == true)
            {
                return BadRequest(new { message = "Cannot delete system button styles" });
            }

            context.ButtonStyleMasters.Remove(buttonStyle);
            await context.SaveChangesAsync();

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Brand not found: {BrandId}", brandId);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting button style {ButtonStyleId} for brand {BrandId}", buttonStyleId, brandId);
            return StatusCode(500, new { message = "An error occurred while deleting the button style" });
        }
    }

    private static string DetermineFontColor(string? backgroundColor)
    {
        if (string.IsNullOrEmpty(backgroundColor))
            return "Light Color";

        // Simple logic to determine if font should be light or dark
        // This is a simplified version - you may want to implement proper color contrast calculation
        var lightColors = new[] { "#FFFFFF", "#F0F0F0", "#E0E0E0", "#D0D0D0", "#C0C0C0", "#B0B0B0", "#A0A0A0" };

        if (lightColors.Any(c => string.Equals(c, backgroundColor, StringComparison.OrdinalIgnoreCase)))
            return "Dark Color";

        return "Light Color";
    }
}