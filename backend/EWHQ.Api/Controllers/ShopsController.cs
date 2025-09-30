using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EWHQ.Api.Data;
using EWHQ.Api.Models.Entities;
using Microsoft.AspNetCore.Authorization;

namespace EWHQ.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ShopsController : ControllerBase
{
    private readonly EWHQDbContext _context;
    private readonly ILogger<ShopsController> _logger;

    public ShopsController(EWHQDbContext context, ILogger<ShopsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/shops/account/{accountId}
    [HttpGet("account/{accountId}")]
    public async Task<ActionResult<IEnumerable<Shop>>> GetShopsByAccount(int accountId)
    {
        try
        {
            var shops = await _context.Shops
                .Where(s => s.AccountId == accountId && s.Enabled)
                .ToListAsync();
            
            return Ok(shops);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting shops for account {AccountId}", accountId);
            return StatusCode(500, new { message = "An error occurred while retrieving shops" });
        }
    }

    // GET: api/shops/{shopId}/{accountId}
    [HttpGet("{shopId}/{accountId}")]
    public async Task<ActionResult<Shop>> GetShop(int shopId, int accountId)
    {
        try
        {
            var shop = await _context.Shops
                .FirstOrDefaultAsync(s => s.ShopId == shopId && s.AccountId == accountId);

            if (shop == null)
            {
                return NotFound();
            }

            return Ok(shop);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting shop {ShopId} for account {AccountId}", shopId, accountId);
            return StatusCode(500, new { message = "An error occurred while retrieving the shop" });
        }
    }

    // POST: api/shops
    [HttpPost]
    public async Task<ActionResult<Shop>> CreateShop(Shop shop)
    {
        try
        {
            shop.CreatedDate = DateTime.UtcNow;
            shop.ModifiedDate = DateTime.UtcNow;
            shop.Enabled = true;

            _context.Shops.Add(shop);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetShop), 
                new { shopId = shop.ShopId, accountId = shop.AccountId }, 
                shop);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating shop");
            return StatusCode(500, new { message = "An error occurred while creating the shop" });
        }
    }

    // PUT: api/shops/{shopId}/{accountId}
    [HttpPut("{shopId}/{accountId}")]
    public async Task<IActionResult> UpdateShop(int shopId, int accountId, Shop shop)
    {
        if (shopId != shop.ShopId || accountId != shop.AccountId)
        {
            return BadRequest();
        }

        try
        {
            shop.ModifiedDate = DateTime.UtcNow;
            _context.Entry(shop).State = EntityState.Modified;
            
            // Don't update certain fields
            _context.Entry(shop).Property(x => x.CreatedDate).IsModified = false;
            _context.Entry(shop).Property(x => x.CreatedBy).IsModified = false;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await ShopExists(shopId, accountId))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating shop {ShopId} for account {AccountId}", shopId, accountId);
            return StatusCode(500, new { message = "An error occurred while updating the shop" });
        }
    }

    // DELETE: api/shops/{shopId}/{accountId}
    [HttpDelete("{shopId}/{accountId}")]
    public async Task<IActionResult> DeleteShop(int shopId, int accountId)
    {
        try
        {
            var shop = await _context.Shops
                .FirstOrDefaultAsync(s => s.ShopId == shopId && s.AccountId == accountId);

            if (shop == null)
            {
                return NotFound();
            }

            // Soft delete
            shop.Enabled = false;
            shop.ModifiedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting shop {ShopId} for account {AccountId}", shopId, accountId);
            return StatusCode(500, new { message = "An error occurred while deleting the shop" });
        }
    }

    private async Task<bool> ShopExists(int shopId, int accountId)
    {
        return await _context.Shops.AnyAsync(s => s.ShopId == shopId && s.AccountId == accountId);
    }
}