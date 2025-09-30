using System.ComponentModel.DataAnnotations;

namespace EWHQ.Api.Data.Attributes;

/// <summary>
/// Represents an unlimited text field that maps to appropriate database types:
/// - SQL Server: nvarchar(max)
/// - PostgreSQL: text
/// For PostgreSQL compatibility, we use a very large but finite MaxLength value.
/// </summary>
public class MaxLengthUnlimitedAttribute : MaxLengthAttribute
{
    // PostgreSQL doesn't support varchar(max), so we use a large value
    // This is effectively unlimited for practical purposes
    private const int PostgreSQLMaxLength = 1073741824; // 1GB limit for PostgreSQL text

    public MaxLengthUnlimitedAttribute() : base(PostgreSQLMaxLength)
    {
    }
}