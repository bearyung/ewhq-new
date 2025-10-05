namespace EWHQ.Api.DTOs;

public class DepartmentDto
{
    public int DepartmentId { get; set; }
    public int AccountId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string? DepartmentCode { get; set; }
    public bool Enabled { get; set; }
}
