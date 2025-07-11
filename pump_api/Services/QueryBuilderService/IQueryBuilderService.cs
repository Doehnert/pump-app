using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using pump_api.Models;

namespace pump_api.Services
{
    public interface IQueryBuilderService
    {
        Task<PaginatedResult<T>> GetPagedResultAsync<T>(
            IQueryable<T> query,
            QueryParameters parameters,
            Dictionary<string, string> allowedSortFields,
            Dictionary<string, string> allowedFilterFields) where T : class;
    }
}