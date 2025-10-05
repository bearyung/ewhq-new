using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using EWHQ.Api.Authorization;
using EWHQ.Api.DTOs;
using EWHQ.Api.Models.Entities;
using EWHQ.Api.Services;

namespace EWHQ.Api.Controllers;

[ApiController]
[Route("api/menu-items")]
[Authorize]
public class MenuItemsController : ControllerBase
{
    private const int MaxPageSize = 200;

    private readonly IPOSDbContextService _posContextService;
    private readonly ILogger<MenuItemsController> _logger;

    public MenuItemsController(
        IPOSDbContextService posContextService,
        ILogger<MenuItemsController> logger)
    {
        _posContextService = posContextService;
        _logger = logger;
    }

    [HttpGet("brand/{brandId}")]
    [RequireBrandView]
    public async Task<ActionResult<MenuItemListResponse>> GetMenuItems(int brandId, [FromQuery] MenuItemListQuery query)
    {
        try
        {
            var (context, accountId) = await _posContextService.GetContextAndAccountIdForBrandAsync(brandId);

            var page = Math.Max(query.Page, 1);
            var pageSize = Math.Clamp(query.PageSize, 1, MaxPageSize);

            var itemsBaseQuery = context.ItemMasters
                .AsNoTracking()
                .Where(i => i.AccountId == accountId);

            if (!query.IncludeDisabled)
            {
                itemsBaseQuery = itemsBaseQuery.Where(i => i.Enabled);
            }

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var term = query.Search.Trim().ToUpperInvariant();
                itemsBaseQuery = itemsBaseQuery.Where(i =>
                    (i.ItemName ?? string.Empty).ToUpper().Contains(term) ||
                    (i.ItemNameAlt ?? string.Empty).ToUpper().Contains(term) ||
                    i.ItemCode.ToUpper().Contains(term));
            }

            if (query.HasModifier.HasValue)
            {
                itemsBaseQuery = itemsBaseQuery.Where(i => i.HasModifier == query.HasModifier.Value);
            }

            if (query.IsPromoItem.HasValue)
            {
                itemsBaseQuery = itemsBaseQuery.Where(i => i.IsPromoItem == query.IsPromoItem.Value);
            }

            var categoryCounts = await itemsBaseQuery
                .GroupBy(i => i.CategoryId)
                .Select(g => new CategoryItemCountDto
                {
                    CategoryId = g.Key,
                    ItemCount = g.Count()
                })
                .ToListAsync();

            var filteredQuery = itemsBaseQuery;

            if (query.CategoryId.HasValue)
            {
                filteredQuery = filteredQuery.Where(i => i.CategoryId == query.CategoryId.Value);
            }

            filteredQuery = ApplySorting(filteredQuery, query);

            var totalItems = await filteredQuery.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var items = await filteredQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(i => new MenuItemSummaryDto
                {
                    ItemId = i.ItemId,
                    AccountId = i.AccountId,
                    CategoryId = i.CategoryId,
                    DepartmentId = i.DepartmentId,
                    ItemCode = i.ItemCode,
                    ItemName = i.ItemName,
                    ItemNameAlt = i.ItemNameAlt,
                    Enabled = i.Enabled,
                    IsItemShow = i.IsItemShow,
                    IsPriceShow = i.IsPriceShow,
                    HasModifier = i.HasModifier,
                    IsModifier = i.IsModifier,
                    IsPromoItem = i.IsPromoItem,
                    IsManualPrice = i.IsManualPrice,
                    IsManualName = i.IsManualName,
                    DisplayIndex = i.DisplayIndex,
                    ItemPublicDisplayName = i.ItemPublicDisplayName,
                    ImageFileName = i.ImageFileName,
                    ModifiedDate = i.ModifiedDate
                })
                .ToListAsync();

            var response = new MenuItemListResponse
            {
                Items = items,
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages,
                CategoryCounts = categoryCounts
            };

            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Brand not found: {BrandId}", brandId);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching menu items for brand {BrandId}", brandId);
            return StatusCode(500, new { message = "An error occurred while fetching menu items" });
        }
    }

    [HttpGet("brand/{brandId}/{itemId}")]
    [RequireBrandView]
    public async Task<ActionResult<MenuItemDetailDto>> GetMenuItem(int brandId, int itemId)
    {
        try
        {
            var (context, accountId) = await _posContextService.GetContextAndAccountIdForBrandAsync(brandId);

            var item = await context.ItemMasters
                .AsNoTracking()
                .FirstOrDefaultAsync(i => i.ItemId == itemId && i.AccountId == accountId);

            if (item == null)
            {
                return NotFound(new { message = "Menu item not found" });
            }

            return Ok(MapToDetailDto(item));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Brand not found: {BrandId}", brandId);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching menu item {ItemId} for brand {BrandId}", itemId, brandId);
            return StatusCode(500, new { message = "An error occurred while fetching the menu item" });
        }
    }

    [HttpPost("brand/{brandId}")]
    [RequireBrandModify]
    public async Task<ActionResult<MenuItemDetailDto>> CreateMenuItem(int brandId, MenuItemUpsertDto createDto)
    {
        try
        {
            var (context, accountId) = await _posContextService.GetContextAndAccountIdForBrandAsync(brandId);

            // Ensure category exists
            var categoryExists = await context.ItemCategories
                .AnyAsync(c => c.CategoryId == createDto.CategoryId && c.AccountId == accountId);
            if (!categoryExists)
            {
                return BadRequest(new { message = "Category not found for this brand" });
            }

            // Ensure department exists
            var departmentExists = await context.Departments
                .AnyAsync(d => d.DepartmentId == createDto.DepartmentId && d.AccountId == accountId);
            if (!departmentExists)
            {
                return BadRequest(new { message = "Department not found for this brand" });
            }

            var normalizedItemCode = createDto.ItemCode.Trim();
            var duplicateCode = await context.ItemMasters
                .AnyAsync(i => i.AccountId == accountId && i.ItemCode == normalizedItemCode);
            if (duplicateCode)
            {
                return Conflict(new { message = "Item code already exists" });
            }

            var currentUser = User.FindFirst(ClaimTypes.Email)?.Value ?? "System";
            var now = DateTime.UtcNow;

            var newItem = new ItemMaster
            {
                AccountId = accountId,
                CreatedDate = now,
                CreatedBy = currentUser,
                ModifiedDate = now,
                ModifiedBy = currentUser
            };

            ApplyUpsertDtoToEntity(newItem, createDto, normalizedItemCode);

            context.ItemMasters.Add(newItem);
            await context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetMenuItem),
                new { brandId, itemId = newItem.ItemId },
                MapToDetailDto(newItem));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Brand not found: {BrandId}", brandId);
            return NotFound(new { message = ex.Message });
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error when creating menu item for brand {BrandId}", brandId);
            return StatusCode(500, new { message = "An error occurred while creating the menu item" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error when creating menu item for brand {BrandId}", brandId);
            return StatusCode(500, new { message = "An error occurred while creating the menu item" });
        }
    }

    [HttpPut("brand/{brandId}/{itemId}")]
    [RequireBrandModify]
    public async Task<ActionResult> UpdateMenuItem(int brandId, int itemId, MenuItemUpsertDto updateDto)
    {
        try
        {
            var (context, accountId) = await _posContextService.GetContextAndAccountIdForBrandAsync(brandId);

            var item = await context.ItemMasters
                .FirstOrDefaultAsync(i => i.ItemId == itemId && i.AccountId == accountId);

            if (item == null)
            {
                return NotFound(new { message = "Menu item not found" });
            }

            var categoryExists = await context.ItemCategories
                .AnyAsync(c => c.CategoryId == updateDto.CategoryId && c.AccountId == accountId);
            if (!categoryExists)
            {
                return BadRequest(new { message = "Category not found for this brand" });
            }

            var departmentExists = await context.Departments
                .AnyAsync(d => d.DepartmentId == updateDto.DepartmentId && d.AccountId == accountId);
            if (!departmentExists)
            {
                return BadRequest(new { message = "Department not found for this brand" });
            }

            var normalizedItemCode = updateDto.ItemCode.Trim();
            var duplicateCode = await context.ItemMasters
                .AnyAsync(i => i.AccountId == accountId && i.ItemId != itemId && i.ItemCode == normalizedItemCode);
            if (duplicateCode)
            {
                return Conflict(new { message = "Item code already exists" });
            }

            ApplyUpsertDtoToEntity(item, updateDto, normalizedItemCode);

            item.ModifiedDate = DateTime.UtcNow;
            item.ModifiedBy = User.FindFirst(ClaimTypes.Email)?.Value ?? "System";

            await context.SaveChangesAsync();

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Brand not found: {BrandId}", brandId);
            return NotFound(new { message = ex.Message });
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database error when updating menu item {ItemId} for brand {BrandId}", itemId, brandId);
            return StatusCode(500, new { message = "An error occurred while updating the menu item" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error when updating menu item {ItemId} for brand {BrandId}", itemId, brandId);
            return StatusCode(500, new { message = "An error occurred while updating the menu item" });
        }
    }

    [HttpGet("brand/{brandId}/lookups")]
    [RequireBrandView]
    public async Task<ActionResult<MenuItemLookupsDto>> GetMenuItemLookups(int brandId)
    {
        try
        {
            var (context, accountId) = await _posContextService.GetContextAndAccountIdForBrandAsync(brandId);

            var categoriesTask = context.ItemCategories
                .AsNoTracking()
                .Where(c => c.AccountId == accountId)
                .OrderBy(c => c.DisplayIndex)
                .ThenBy(c => c.CategoryName)
                .Select(c => new ItemCategoryDto
                {
                    CategoryId = c.CategoryId,
                    AccountId = c.AccountId,
                    CategoryName = c.CategoryName ?? string.Empty,
                    CategoryNameAlt = c.CategoryNameAlt,
                    DisplayIndex = c.DisplayIndex,
                    ParentCategoryId = c.ParentCategoryId,
                    IsTerminal = c.IsTerminal,
                    IsPublicDisplay = c.IsPublicDisplay,
                    ButtonStyleId = c.ButtonStyleId,
                    PrinterName = c.PrinterName,
                    IsModifier = c.IsModifier,
                    Enabled = c.Enabled,
                    CreatedDate = c.CreatedDate,
                    CreatedBy = c.CreatedBy,
                    ModifiedDate = c.ModifiedDate,
                    ModifiedBy = c.ModifiedBy,
                    CategoryTypeId = c.CategoryTypeId,
                    ImageFileName = c.ImageFileName,
                    IsSelfOrderingDisplay = c.IsSelfOrderingDisplay,
                    IsOnlineStoreDisplay = c.IsOnlineStoreDisplay,
                    CategoryCode = c.CategoryCode
                })
                .ToListAsync();

            var buttonStylesTask = context.ButtonStyleMasters
                .AsNoTracking()
                .Where(bs => bs.AccountId == accountId && bs.IsSystemUse != true)
                .OrderBy(bs => bs.StyleName)
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
                    ModifiedBy = bs.ModifiedBy
                })
                .ToListAsync();

            var departmentsTask = context.Departments
                .AsNoTracking()
                .Where(d => d.AccountId == accountId && d.Enabled)
                .OrderBy(d => d.DepartmentName)
                .Select(d => new DepartmentDto
                {
                    DepartmentId = d.DepartmentId,
                    AccountId = d.AccountId,
                    DepartmentName = d.DepartmentName,
                    DepartmentCode = d.DepartmentCode,
                    Enabled = d.Enabled
                })
                .ToListAsync();

            var modifierGroupsTask = context.ModifierGroupHeaders
                .AsNoTracking()
                .Where(mg => mg.AccountId == accountId && mg.Enabled)
                .OrderBy(mg => mg.GroupBatchName)
                .Select(mg => new ModifierGroupHeaderDto
                {
                    GroupHeaderId = mg.GroupHeaderId,
                    AccountId = mg.AccountId,
                    GroupBatchName = mg.GroupBatchName,
                    GroupBatchNameAlt = mg.GroupBatchNameAlt,
                    Enabled = mg.Enabled
                })
                .ToListAsync();

            await Task.WhenAll(categoriesTask, buttonStylesTask, departmentsTask, modifierGroupsTask);

            return Ok(new MenuItemLookupsDto
            {
                Categories = categoriesTask.Result,
                ButtonStyles = buttonStylesTask.Result,
                Departments = departmentsTask.Result,
                ModifierGroups = modifierGroupsTask.Result
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Brand not found: {BrandId}", brandId);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching menu item lookups for brand {BrandId}", brandId);
            return StatusCode(500, new { message = "An error occurred while fetching menu item lookups" });
        }
    }

    private static IQueryable<ItemMaster> ApplySorting(IQueryable<ItemMaster> query, MenuItemListQuery request)
    {
        var direction = string.Equals(request.SortDirection, "desc", StringComparison.OrdinalIgnoreCase) ? "desc" : "asc";
        var sortBy = request.SortBy?.ToLowerInvariant();

        return (sortBy) switch
        {
            "name" => direction == "desc"
                ? query.OrderByDescending(i => i.ItemName ?? i.ItemCode).ThenByDescending(i => i.ItemId)
                : query.OrderBy(i => i.ItemName ?? i.ItemCode).ThenBy(i => i.ItemId),
            "modified" or "modifieddate" => direction == "desc"
                ? query.OrderByDescending(i => i.ModifiedDate ?? i.CreatedDate ?? DateTime.MinValue).ThenByDescending(i => i.ItemId)
                : query.OrderBy(i => i.ModifiedDate ?? i.CreatedDate ?? DateTime.MinValue).ThenBy(i => i.ItemId),
            _ => direction == "desc"
                ? query.OrderByDescending(i => i.DisplayIndex).ThenByDescending(i => i.ItemId)
                : query.OrderBy(i => i.DisplayIndex).ThenBy(i => i.ItemId)
        };
    }

    private static void ApplyUpsertDtoToEntity(ItemMaster entity, MenuItemUpsertDto dto, string normalizedItemCode)
    {
        entity.ItemCode = normalizedItemCode;
        entity.ItemName = dto.ItemName ?? string.Empty;
        entity.ItemNameAlt = dto.ItemNameAlt ?? string.Empty;
        entity.ItemNameAlt2 = dto.ItemNameAlt2 ?? string.Empty;
        entity.ItemNameAlt3 = dto.ItemNameAlt3 ?? string.Empty;
        entity.ItemNameAlt4 = dto.ItemNameAlt4 ?? string.Empty;
        entity.ItemPosName = dto.ItemPosName ?? string.Empty;
        entity.ItemPosNameAlt = dto.ItemPosNameAlt ?? string.Empty;
        entity.ItemPublicDisplayName = dto.ItemPublicDisplayName ?? string.Empty;
        entity.ItemPublicDisplayNameAlt = dto.ItemPublicDisplayNameAlt ?? string.Empty;
        entity.ItemPublicPrintedName = dto.ItemPublicPrintedName ?? string.Empty;
        entity.ItemPublicPrintedNameAlt = dto.ItemPublicPrintedNameAlt ?? string.Empty;
        entity.Remark = dto.Remark ?? string.Empty;
        entity.RemarkAlt = dto.RemarkAlt ?? string.Empty;
        entity.ImageFileName = dto.ImageFileName ?? string.Empty;
        entity.ImageFileName2 = dto.ImageFileName2 ?? string.Empty;
        entity.TableOrderingImageFileName = dto.TableOrderingImageFileName ?? string.Empty;
        entity.CategoryId = dto.CategoryId;
        entity.DepartmentId = dto.DepartmentId;
        entity.SubDepartmentId = dto.SubDepartmentId;
        entity.DisplayIndex = dto.DisplayIndex;
        entity.Enabled = dto.Enabled;
        entity.IsItemShow = dto.IsItemShow;
        entity.IsPriceShow = dto.IsPriceShow;
        entity.HasModifier = dto.HasModifier;
        entity.AutoRedirectToModifier = dto.AutoRedirectToModifier;
        entity.IsModifier = dto.IsModifier;
        entity.ModifierGroupHeaderId = dto.ModifierGroupHeaderId;
        entity.ButtonStyleId = dto.ButtonStyleId;
        entity.IsManualPrice = dto.IsManualPrice;
        entity.IsManualName = dto.IsManualName;
        entity.IsPromoItem = dto.IsPromoItem;
        entity.IsModifierConcatToParent = dto.IsModifierConcatToParent;
        entity.IsFollowSet = dto.IsFollowSet;
        entity.IsFollowSetDynamic = dto.IsFollowSetDynamic;
        entity.IsFollowSetStandard = dto.IsFollowSetStandard;
        entity.IsNonDiscountItem = dto.IsNonDiscountItem;
        entity.IsNonServiceChargeItem = dto.IsNonServiceChargeItem;
        entity.IsStandaloneAndSetItem = dto.IsStandaloneAndSetItem;
        entity.IsGroupRightItem = dto.IsGroupRightItem;
        entity.IsPrintLabel = dto.IsPrintLabel;
        entity.IsPrintLabelTakeaway = dto.IsPrintLabelTakeaway;
        entity.IsPriceInPercentage = dto.IsPriceInPercentage;
        entity.IsPointPaidItem = dto.IsPointPaidItem;
        entity.IsNoPointEarnItem = dto.IsNoPointEarnItem;
        entity.IsNonTaxableItem = dto.IsNonTaxableItem;
        entity.IsItemShowInKitchenChecklist = dto.IsItemShowInKitchenChecklist;
        entity.IsSoldoutAutoLock = dto.IsSoldoutAutoLock;
        entity.IsPrepaidRechargeItem = dto.IsPrepaidRechargeItem;
        entity.IsAutoLinkWithRawMaterial = dto.IsAutoLinkWithRawMaterial;
        entity.IsDinein = dto.IsDinein;
        entity.IsTakeaway = dto.IsTakeaway;
        entity.IsDelivery = dto.IsDelivery;
        entity.IsKitchenPrintInRedColor = dto.IsKitchenPrintInRedColor;
        entity.IsManualPriceGroup = dto.IsManualPriceGroup;
        entity.IsExcludeLabelCount = dto.IsExcludeLabelCount;
        entity.ServingSize = dto.ServingSize;
        entity.SystemRemark = dto.SystemRemark ?? string.Empty;
        entity.IsNonSalesItem = dto.IsNonSalesItem;
        entity.ProductionSeconds = dto.ProductionSeconds;
        entity.ParentItemId = dto.ParentItemId;
        entity.IsComboRequired = dto.IsComboRequired;
    }

    private static MenuItemDetailDto MapToDetailDto(ItemMaster item)
    {
        return new MenuItemDetailDto
        {
            ItemId = item.ItemId,
            AccountId = item.AccountId,
            CategoryId = item.CategoryId,
            DepartmentId = item.DepartmentId,
            ItemCode = item.ItemCode,
            ItemName = item.ItemName,
            ItemNameAlt = item.ItemNameAlt,
            ItemNameAlt2 = item.ItemNameAlt2,
            ItemNameAlt3 = item.ItemNameAlt3,
            ItemNameAlt4 = item.ItemNameAlt4,
            ItemPosName = item.ItemPosName,
            ItemPosNameAlt = item.ItemPosNameAlt,
            ItemPublicDisplayName = item.ItemPublicDisplayName,
            ItemPublicDisplayNameAlt = item.ItemPublicDisplayNameAlt,
            ItemPublicPrintedName = item.ItemPublicPrintedName,
            ItemPublicPrintedNameAlt = item.ItemPublicPrintedNameAlt,
            Remark = item.Remark,
            RemarkAlt = item.RemarkAlt,
            ImageFileName = item.ImageFileName,
            ImageFileName2 = item.ImageFileName2,
            TableOrderingImageFileName = item.TableOrderingImageFileName,
            DisplayIndex = item.DisplayIndex,
            Enabled = item.Enabled,
            IsItemShow = item.IsItemShow,
            IsPriceShow = item.IsPriceShow,
            HasModifier = item.HasModifier,
            AutoRedirectToModifier = item.AutoRedirectToModifier,
            IsModifier = item.IsModifier,
            ModifierGroupHeaderId = item.ModifierGroupHeaderId,
            ButtonStyleId = item.ButtonStyleId,
            IsManualPrice = item.IsManualPrice,
            IsManualName = item.IsManualName,
            IsPromoItem = item.IsPromoItem,
            IsModifierConcatToParent = item.IsModifierConcatToParent,
            IsFollowSet = item.IsFollowSet,
            IsFollowSetDynamic = item.IsFollowSetDynamic,
            IsFollowSetStandard = item.IsFollowSetStandard,
            IsNonDiscountItem = item.IsNonDiscountItem,
            IsNonServiceChargeItem = item.IsNonServiceChargeItem,
            IsStandaloneAndSetItem = item.IsStandaloneAndSetItem,
            IsGroupRightItem = item.IsGroupRightItem,
            IsPrintLabel = item.IsPrintLabel,
            IsPrintLabelTakeaway = item.IsPrintLabelTakeaway,
            IsPriceInPercentage = item.IsPriceInPercentage,
            IsPointPaidItem = item.IsPointPaidItem,
            IsNoPointEarnItem = item.IsNoPointEarnItem,
            IsNonTaxableItem = item.IsNonTaxableItem,
            IsItemShowInKitchenChecklist = item.IsItemShowInKitchenChecklist,
            IsSoldoutAutoLock = item.IsSoldoutAutoLock,
            IsPrepaidRechargeItem = item.IsPrepaidRechargeItem,
            IsAutoLinkWithRawMaterial = item.IsAutoLinkWithRawMaterial,
            IsDinein = item.IsDinein,
            IsTakeaway = item.IsTakeaway,
            IsDelivery = item.IsDelivery,
            IsKitchenPrintInRedColor = item.IsKitchenPrintInRedColor,
            IsManualPriceGroup = item.IsManualPriceGroup,
            SubDepartmentId = item.SubDepartmentId,
            IsExcludeLabelCount = item.IsExcludeLabelCount,
            ServingSize = item.ServingSize,
            SystemRemark = item.SystemRemark,
            IsNonSalesItem = item.IsNonSalesItem,
            ProductionSeconds = item.ProductionSeconds,
            ParentItemId = item.ParentItemId,
            IsComboRequired = item.IsComboRequired,
            ModifiedDate = item.ModifiedDate,
            CreatedDate = item.CreatedDate,
            CreatedBy = item.CreatedBy,
            ModifiedBy = item.ModifiedBy
        };
    }
}
