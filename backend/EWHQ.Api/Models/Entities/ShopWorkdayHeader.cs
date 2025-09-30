using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EWHQ.Api.Models.Entities;

[Table("ShopWorkdayHeader")]
public class ShopWorkdayHeader
{
    [Key]
    [Column(Order = 0)]
    public int WorkdayHeaderId { get; set; }

    [Key]
    [Column(Order = 1)]
    public int AccountId { get; set; }

    [Key]
    [Column(Order = 2)]
    public int ShopId { get; set; }

    [MaxLength(1)]
    [Required]
    public string Day { get; set; } = string.Empty;

    public TimeSpan OpenTime { get; set; }

    public TimeSpan CloseTime { get; set; }

    public int DayDelta { get; set; }

    public bool Enabled { get; set; }

    public DateTime CreatedDate { get; set; }

    [MaxLength(50)]
    [Required]
    public string CreatedBy { get; set; } = string.Empty;

    public DateTime ModifiedDate { get; set; }

    [MaxLength(50)]
    [Required]
    public string ModifedBy { get; set; } = string.Empty;

}
