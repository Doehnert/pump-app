using AutoMapper;
using pump_api.Data;
using pump_api.Dtos.Pump;
using pump_api.Models;
using pump_api.Services;

namespace pump_api.Services.PumpService
{
    public class PumpService : IPumpService
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        private readonly IQueryBuilderService _queryBuilder;

        public PumpService(DataContext context, IMapper mapper, IQueryBuilderService queryBuilder)
        {
            _context = context;
            _mapper = mapper;
            _queryBuilder = queryBuilder;
        }

        public async Task<ServiceResponse<PaginatedResult<GetPumpDto>>> GetAllPumps(int userId, QueryParameters parameters)
        {
            var query = _context.Pumps.AsQueryable();

            User user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return new ServiceResponse<PaginatedResult<GetPumpDto>>
                {
                    Success = false,
                    Message = "User not found"
                };
            }

            // If user is not Admin, only return their associated pumps
            if (user.Role != UserRole.Admin)
            {
                query = query.Where(p => p.UserId == userId);
            }

            // Define allowed sort and filter fields
            var allowedSortFields = new Dictionary<string, string>
            {
                { "name", "Name" },
                { "type", "Type" },
                { "area", "Area" },
                { "lat", "Latitude" },
                { "lng", "Longitude" },
                { "flow", "FlowRate" },
                { "offset", "Offset" },
                { "current", "CurrentPressure" },
                { "min", "MinPressure" },
                { "max", "MaxPressure" },
                { "lastupdated", "LastUpdated" }
            };

            var allowedFilterFields = new Dictionary<string, string>
            {
                { "name", "Name" },
                { "type", "Type" },
                { "area", "Area" }
            };

            try
            {
                var pagedResult = await _queryBuilder.GetPagedResultAsync(
                    query,
                    parameters,
                    allowedSortFields,
                    allowedFilterFields);

                var mappedData = pagedResult.Data.Select(p => _mapper.Map<GetPumpDto>(p)).ToList();

                return new ServiceResponse<PaginatedResult<GetPumpDto>>
                {
                    Data = new PaginatedResult<GetPumpDto>
                    {
                        Data = mappedData,
                        TotalCount = pagedResult.TotalCount,
                        PageNumber = pagedResult.PageNumber,
                        PageSize = pagedResult.PageSize,
                        TotalPages = pagedResult.TotalPages
                    },
                    Success = true,
                    Message = $"Found {pagedResult.TotalCount} pumps"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<PaginatedResult<GetPumpDto>>
                {
                    Success = false,
                    Message = $"Error retrieving pumps: {ex.Message}"
                };
            }
        }

        public async Task<ServiceResponse<GetPumpDto>> GetPumpById(int id, int userId = 0)
        {
            var pump = await _context.Pumps.FirstOrDefaultAsync(p => p.Id == id);
            if (pump == null)
            {
                return new ServiceResponse<GetPumpDto>
                {
                    Success = false,
                    Message = "Pump not found"
                };
            }

            // If userId is provided, check if user has access to this pump
            if (userId != 0)
            {
                User user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return new ServiceResponse<GetPumpDto>
                    {
                        Success = false,
                        Message = "User not found"
                    };
                }

                // If user is not Admin, check if they own this pump
                if (user.Role != UserRole.Admin && pump.UserId != userId)
                {
                    return new ServiceResponse<GetPumpDto>
                    {
                        Success = false,
                        Message = "Access denied. You can only view your own pumps."
                    };
                }
            }

            return new ServiceResponse<GetPumpDto>
            {
                Data = _mapper.Map<GetPumpDto>(pump),
                Success = true
            };
        }

        public async Task<ServiceResponse<List<GetPumpDto>>> AddPump(AddPumpDto pump, int userId)
        {
            try
            {
                var pumpEntity = _mapper.Map<Pump>(pump);
                pumpEntity.UserId = userId;
                pumpEntity.LastUpdated = DateTime.UtcNow;

                _context.Pumps.Add(pumpEntity);
                await _context.SaveChangesAsync();

                return new ServiceResponse<List<GetPumpDto>>
                {
                    Data = _context.Pumps.ToList().Select(p => _mapper.Map<GetPumpDto>(p)).ToList(),
                    Success = true,
                    Message = "Pump added successfully"
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponse<List<GetPumpDto>>
                {
                    Success = false,
                    Message = $"Error adding pump: {ex.Message}"
                };
            }
        }

        public async Task<ServiceResponse<GetPumpDto>> UpdatePump(UpdatePumpDto pump, int id, int userId = 0)
        {
            try
            {
                var dbPump = await _context.Pumps.FirstOrDefaultAsync(p => p.Id == id);
                if (dbPump == null)
                {
                    return new ServiceResponse<GetPumpDto> { Success = false, Message = "Pump not found" };
                }

                // If userId is provided, check if user has access to this pump
                if (userId != 0)
                {
                    User user = await _context.Users.FindAsync(userId);
                    if (user == null)
                    {
                        return new ServiceResponse<GetPumpDto> { Success = false, Message = "User not found" };
                    }

                    // If user is not Admin, check if they own this pump
                    if (user.Role != UserRole.Admin && dbPump.UserId != userId)
                    {
                        return new ServiceResponse<GetPumpDto> { Success = false, Message = "Access denied. You can only update your own pumps." };
                    }
                }

                dbPump.LastUpdated = DateTime.UtcNow;
                _mapper.Map(pump, dbPump);
                await _context.SaveChangesAsync();
                return new ServiceResponse<GetPumpDto> { Data = _mapper.Map<GetPumpDto>(dbPump), Success = true };
            }
            catch (System.Exception ex)
            {
                return new ServiceResponse<GetPumpDto> { Success = false, Message = ex.Message };
            }
        }

        public async Task<ServiceResponse<List<GetPumpDto>>> DeletePump(int id, int userId = 0)
        {
            try
            {
                var dbPump = await _context.Pumps.FirstOrDefaultAsync(p => p.Id == id);
                if (dbPump == null)
                {
                    return new ServiceResponse<List<GetPumpDto>> { Success = false, Message = "Pump not found" };
                }

                // If userId is provided, check if user has access to this pump
                if (userId != 0)
                {
                    User user = await _context.Users.FindAsync(userId);
                    if (user == null)
                    {
                        return new ServiceResponse<List<GetPumpDto>> { Success = false, Message = "User not found" };
                    }

                    // Only Admin can delete pumps
                    if (user.Role != UserRole.Admin)
                    {
                        return new ServiceResponse<List<GetPumpDto>> { Success = false, Message = "Access denied. Only administrators can delete pumps." };
                    }
                }

                _context.Pumps.Remove(dbPump);
                await _context.SaveChangesAsync();
                return new ServiceResponse<List<GetPumpDto>> { Data = _context.Pumps.ToList().Select(p => _mapper.Map<GetPumpDto>(p)).ToList(), Success = true };
            }
            catch (System.Exception ex)
            {
                return new ServiceResponse<List<GetPumpDto>> { Success = false, Message = ex.Message };
            }
        }


    }
}