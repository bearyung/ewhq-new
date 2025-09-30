namespace EWHQ.Api.DTOs;

public class ButtonStyleDto
{
    public int ButtonStyleId { get; set; }
    public int AccountId { get; set; }
    public string StyleName { get; set; } = string.Empty;
    public string? StyleNameAlt { get; set; }
    public string? ResourceStyleName { get; set; }
    public string? BackgroundColorTop { get; set; }
    public string? BackgroundColorMiddle { get; set; }
    public string? BackgroundColorBottom { get; set; }
    public bool Enabled { get; set; }
    public int FontSize { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
    public int? ImageModeWidth { get; set; }
    public int? ImageModeHeight { get; set; }
    public int? ImageModeFontSize { get; set; }
    public string? ImageModeResourceStyleName { get; set; }
    public bool? IsSystemUse { get; set; }
    public DateTime? CreatedDate { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? ModifiedDate { get; set; }
    public string? ModifiedBy { get; set; }
}

public class CreateButtonStyleDto
{
    public string StyleName { get; set; } = string.Empty;
    public string? StyleNameAlt { get; set; }
    public string? ResourceStyleName { get; set; }
    public string? BackgroundColorTop { get; set; }
    public string? BackgroundColorMiddle { get; set; }
    public string? BackgroundColorBottom { get; set; }
    public bool Enabled { get; set; } = true;
    public int FontSize { get; set; } = 22;
    public int? Width { get; set; } = 115;
    public int? Height { get; set; } = 84;
    public int? ImageModeWidth { get; set; }
    public int? ImageModeHeight { get; set; }
    public int? ImageModeFontSize { get; set; }
    public string? ImageModeResourceStyleName { get; set; }
}

public class UpdateButtonStyleDto
{
    public string StyleName { get; set; } = string.Empty;
    public string? StyleNameAlt { get; set; }
    public string? ResourceStyleName { get; set; }
    public string? BackgroundColorTop { get; set; }
    public string? BackgroundColorMiddle { get; set; }
    public string? BackgroundColorBottom { get; set; }
    public bool Enabled { get; set; }
    public int FontSize { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
    public int? ImageModeWidth { get; set; }
    public int? ImageModeHeight { get; set; }
    public int? ImageModeFontSize { get; set; }
    public string? ImageModeResourceStyleName { get; set; }
}