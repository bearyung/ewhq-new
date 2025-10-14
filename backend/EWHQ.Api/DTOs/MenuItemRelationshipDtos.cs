using System;

namespace EWHQ.Api.DTOs;

public class ItemRelationshipTreeDto
{
    public ItemRelationshipItemNodeDto Root { get; set; } = new();
}

public class ItemRelationshipItemNodeDto
{
    public MenuItemSummaryDto Item { get; set; } = new();
    public ItemRelationshipContextDto InStore { get; set; } = new();
    public ItemRelationshipContextDto Online { get; set; } = new();
}

public class ItemRelationshipContextDto
{
    public IReadOnlyList<ItemRelationshipModifierNodeDto> Modifiers { get; set; } = Array.Empty<ItemRelationshipModifierNodeDto>();
    public IReadOnlyList<ItemRelationshipSetNodeDto> ItemSets { get; set; } = Array.Empty<ItemRelationshipSetNodeDto>();
}

public class ItemRelationshipModifierNodeDto
{
    public int GroupHeaderId { get; set; }
    public int Sequence { get; set; }
    public string? LinkType { get; set; }
    public ModifierGroupHeaderDto Group { get; set; } = new();
}

public class ItemRelationshipSetNodeDto
{
    public int ItemSetId { get; set; }
    public int GroupHeaderId { get; set; }
    public int Sequence { get; set; }
    public string? LinkType { get; set; }
    public ModifierGroupHeaderDto Group { get; set; } = new();
    public IReadOnlyList<ItemRelationshipItemNodeDto> Children { get; set; } = Array.Empty<ItemRelationshipItemNodeDto>();
}

public class UpdateItemRelationshipTreeDto
{
    public UpdateItemRelationshipNodeDto Root { get; set; } = new();
}

public class UpdateItemRelationshipNodeDto
{
    public int ItemId { get; set; }
    public UpdateItemRelationshipContextDto InStore { get; set; } = new();
    public UpdateItemRelationshipContextDto Online { get; set; } = new();
}

public class UpdateItemRelationshipContextDto
{
    public IReadOnlyList<ItemModifierMappingUpsertDto> Modifiers { get; set; } = Array.Empty<ItemModifierMappingUpsertDto>();
    public IReadOnlyList<UpdateItemRelationshipSetDto> ItemSets { get; set; } = Array.Empty<UpdateItemRelationshipSetDto>();
}

public class UpdateItemRelationshipSetDto
{
    public int? ItemSetId { get; set; }
    public int GroupHeaderId { get; set; }
    public int Sequence { get; set; }
    public IReadOnlyList<UpdateItemRelationshipNodeDto> Children { get; set; } = Array.Empty<UpdateItemRelationshipNodeDto>();
}
