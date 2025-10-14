using System;
using System.Collections.Generic;

namespace EWHQ.Api.DTOs;

public class ModifierGroupPreviewItemDto
{
    public int ItemId { get; set; }
    public string ItemCode { get; set; } = string.Empty;
    public string? ItemName { get; set; }
    public bool Enabled { get; set; }
    public int DisplayIndex { get; set; }
}

public class ModifierGroupPreviewDto
{
    public int GroupHeaderId { get; set; }
    public string GroupBatchName { get; set; } = string.Empty;
    public IReadOnlyList<ModifierGroupPreviewItemDto> Items { get; set; } = Array.Empty<ModifierGroupPreviewItemDto>();
}
