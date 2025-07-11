using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using pump_api.Models;
using System.Linq.Dynamic.Core;

namespace pump_api.Services
{
  public class QueryBuilderService : IQueryBuilderService
  {
    public async Task<PaginatedResult<T>> GetPagedResultAsync<T>(
        IQueryable<T> query,
        QueryParameters parameters,
        Dictionary<string, string> allowedSortFields,
        Dictionary<string, string> allowedFilterFields) where T : class
    {
      // Apply search
      if (!string.IsNullOrEmpty(parameters.Search))
      {
        query = ApplySearch(query, parameters.Search, allowedFilterFields);
      }

      // Apply filters
      if (!string.IsNullOrEmpty(parameters.Filter))
      {
        query = ApplyFilters(query, parameters.Filter, allowedFilterFields);
      }

      // Get total count before pagination
      var totalCount = await query.CountAsync();

      // Apply sorting
      if (!string.IsNullOrEmpty(parameters.SortBy) && allowedSortFields.ContainsKey(parameters.SortBy.ToLower()))
      {
        var sortField = allowedSortFields[parameters.SortBy.ToLower()];
        var sortDirection = parameters.SortDirection?.ToLower() == "desc" ? "descending" : "ascending";
        query = query.OrderBy($"{sortField} {sortDirection}");
      }

      // Apply pagination
      var skip = (parameters.PageNumber - 1) * parameters.PageSize;
      var data = await query.Skip(skip).Take(parameters.PageSize).ToListAsync();

      return new PaginatedResult<T>
      {
        Data = data,
        TotalCount = totalCount,
        PageNumber = parameters.PageNumber,
        PageSize = parameters.PageSize,
        TotalPages = (int)Math.Ceiling((double)totalCount / parameters.PageSize)
      };
    }

    private IQueryable<T> ApplySearch<T>(IQueryable<T> query, string searchTerm, Dictionary<string, string> allowedFields) where T : class
    {
      if (string.IsNullOrEmpty(searchTerm) || !allowedFields.Any())
        return query;

      var searchConditions = new List<string>();

      foreach (var field in allowedFields)
      {
        // Handle different field types appropriately
        if (field.Value == "Type" || field.Value == "Status" || field.Value == "Role")
        {
          // For enum fields, exclude from search as they don't work well with dynamic LINQ
          // Users can still filter by enum values using the filter functionality
          continue;
        }
        else
        {
          // For string fields, use direct Contains
          searchConditions.Add($"{field.Value}.Contains(\"{searchTerm}\")");
        }
      }

      if (searchConditions.Any())
      {
        var searchExpression = string.Join(" OR ", searchConditions);
        return query.Where(searchExpression);
      }

      return query;
    }

    private IQueryable<T> ApplyFilters<T>(IQueryable<T> query, string filterString, Dictionary<string, string> allowedFields) where T : class
    {
      if (string.IsNullOrEmpty(filterString) || !allowedFields.Any())
        return query;

      try
      {
        // Parse filter string (format: "field:value,field2:value2")
        var filters = filterString.Split(',')
            .Select(f => f.Split(':'))
            .Where(f => f.Length == 2)
            .ToDictionary(f => f[0].Trim().ToLower(), f => f[1].Trim());

        var filterConditions = new List<string>();

        foreach (var filter in filters)
        {
          if (allowedFields.ContainsKey(filter.Key))
          {
            var fieldName = allowedFields[filter.Key];
            filterConditions.Add($"{fieldName} == \"{filter.Value}\"");
          }
        }

        if (filterConditions.Any())
        {
          var filterExpression = string.Join(" AND ", filterConditions);
          return query.Where(filterExpression);
        }
      }
      catch
      {
        // If filter parsing fails, return original query
        return query;
      }

      return query;
    }
  }
}