using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using pump_api.Data;
using pump_api.Models;
using pump_api.Services.PumpService;

namespace pump_api.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class DashboardController : ControllerBase
  {
    private readonly DataContext _context;
    private readonly IPumpService _pumpService;

    public DashboardController(DataContext context, IPumpService pumpService)
    {
      _context = context;
      _pumpService = pumpService;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<ServiceResponse<object>>> GetDashboardStats()
    {
      var response = new ServiceResponse<object>();

      try
      {
        var totalPumps = await _context.Pumps.CountAsync();
        var operationalPumps = await _context.Pumps.CountAsync(p => p.CurrentPressure >= p.MinPressure && p.CurrentPressure <= p.MaxPressure);
        var totalInspections = await _context.PumpInspections.CountAsync();
        var recentInspections = await _context.PumpInspections.CountAsync(pi => pi.InspectionDate >= DateTime.UtcNow.AddDays(-7));

        // Pump types distribution
        var pumpTypes = await _context.Pumps
            .GroupBy(p => p.Type)
            .Select(g => new { Type = g.Key.ToString(), Count = g.Count() })
            .ToListAsync();

        // Inspection status distribution
        var inspectionStatuses = await _context.PumpInspections
            .GroupBy(pi => pi.Status)
            .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
            .ToListAsync();

        // Area distribution
        var areaDistribution = await _context.Pumps
            .GroupBy(p => p.Area)
            .Select(g => new { Area = g.Key, Count = g.Count() })
            .ToListAsync();

        // Recent pressure readings (last 7 days)
        var recentPressureReadings = await _context.PumpInspections
            .Where(pi => pi.InspectionDate >= DateTime.UtcNow.AddDays(-7))
            .OrderBy(pi => pi.InspectionDate)
            .Select(pi => new
            {
              Date = pi.InspectionDate,
              Pressure = pi.PressureReading,
              PumpName = pi.Pump.Name
            })
            .ToListAsync();

        var stats = new
        {
          Summary = new
          {
            TotalPumps = totalPumps,
            OperationalPumps = operationalPumps,
            NonOperationalPumps = totalPumps - operationalPumps,
            TotalInspections = totalInspections,
            RecentInspections = recentInspections
          },
          PumpTypes = pumpTypes,
          InspectionStatuses = inspectionStatuses,
          AreaDistribution = areaDistribution,
          RecentPressureReadings = recentPressureReadings
        };

        response.Data = stats;
        response.Success = true;
        response.Message = "Dashboard statistics retrieved successfully";
      }
      catch (Exception ex)
      {
        response.Success = false;
        response.Message = $"Error retrieving dashboard statistics: {ex.Message}";
      }

      return Ok(response);
    }
  }
}