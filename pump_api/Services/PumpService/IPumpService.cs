using pump_api.Models;
using pump_api.Dtos.Pump;
namespace pump_api.Services.PumpService
{
    public interface IPumpService
    {
        Task<ServiceResponse<PaginatedResult<GetPumpDto>>> GetAllPumps(int userId, QueryParameters parameters);
        Task<ServiceResponse<GetPumpDto>> GetPumpById(int id, int userId = 0);
        Task<ServiceResponse<List<GetPumpDto>>> AddPump(AddPumpDto pump, int userId);
        Task<ServiceResponse<GetPumpDto>> UpdatePump(UpdatePumpDto pump, int id, int userId = 0);
        Task<ServiceResponse<List<GetPumpDto>>> DeletePump(int id, int userId = 0);
    }
}