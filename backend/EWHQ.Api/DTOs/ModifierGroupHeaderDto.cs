namespace EWHQ.Api.DTOs;

public class ModifierGroupHeaderDto
{
    public int GroupHeaderId { get; set; }
    public int AccountId { get; set; }
    public string GroupBatchName { get; set; } = string.Empty;
    public string? GroupBatchNameAlt { get; set; }
    public bool Enabled { get; set; }
    public bool IsFollowSet { get; set; }
}
