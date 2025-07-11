using System.ComponentModel.DataAnnotations;

namespace pump_api.Models
{
  public class QueryParameters
  {
    private const int MaxPageSize = 50;
    private int _pageSize = 10;

    [Range(1, int.MaxValue, ErrorMessage = "Page number must be greater than 0")]
    public int PageNumber { get; set; } = 1;

    [Range(1, 50, ErrorMessage = "Page size must be between 1 and 50")]
    public int PageSize
    {
      get => _pageSize;
      set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
    }

    public string? SortBy { get; set; }
    public string? SortDirection { get; set; } = "asc"; // "asc" or "desc"
    public string? Search { get; set; }
    public string? Filter { get; set; }
  }

  public class PaginatedResult<T>
  {
    public List<T> Data { get; set; } = new List<T>();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
  }
}