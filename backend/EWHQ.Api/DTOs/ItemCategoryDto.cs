namespace EWHQ.Api.DTOs;

public class ItemCategoryDto
{
    public int CategoryId { get; set; }
    public int AccountId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? CategoryNameAlt { get; set; }
    public int DisplayIndex { get; set; }
    public int? ParentCategoryId { get; set; }
    public bool IsTerminal { get; set; }
    public bool IsPublicDisplay { get; set; }
    public int? ButtonStyleId { get; set; }
    public string? PrinterName { get; set; }
    public bool IsModifier { get; set; }
    public bool Enabled { get; set; }
    public DateTime? CreatedDate { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? ModifiedDate { get; set; }
    public string? ModifiedBy { get; set; }
    public int? CategoryTypeId { get; set; }
    public string? ImageFileName { get; set; }
    public bool? IsSelfOrderingDisplay { get; set; }
    public bool? IsOnlineStoreDisplay { get; set; }
    public string? CategoryCode { get; set; }
}

public class CreateItemCategoryDto
{
    public string CategoryName { get; set; } = string.Empty;
    public string? CategoryNameAlt { get; set; }
    public int DisplayIndex { get; set; } = 0;
    public int? ParentCategoryId { get; set; }
    public bool IsTerminal { get; set; } = true;
    public bool IsPublicDisplay { get; set; } = true;
    public int? ButtonStyleId { get; set; }
    public string? PrinterName { get; set; }
    public bool IsModifier { get; set; } = false;
    public bool Enabled { get; set; } = true;
    public int? CategoryTypeId { get; set; }
    public string? ImageFileName { get; set; }
    public bool? IsSelfOrderingDisplay { get; set; } = true;
    public bool? IsOnlineStoreDisplay { get; set; } = true;
    public string? CategoryCode { get; set; }
}

public class UpdateItemCategoryDto
{
    public string CategoryName { get; set; } = string.Empty;
    public string? CategoryNameAlt { get; set; }
    public int DisplayIndex { get; set; }
    public int? ParentCategoryId { get; set; }
    public bool IsTerminal { get; set; }
    public bool IsPublicDisplay { get; set; }
    public int? ButtonStyleId { get; set; }
    public string? PrinterName { get; set; }
    public bool IsModifier { get; set; }
    public bool Enabled { get; set; }
    public int? CategoryTypeId { get; set; }
    public string? ImageFileName { get; set; }
    public bool? IsSelfOrderingDisplay { get; set; }
    public bool? IsOnlineStoreDisplay { get; set; }
    public string? CategoryCode { get; set; }
}
