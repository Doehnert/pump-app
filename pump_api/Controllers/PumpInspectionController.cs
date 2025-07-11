using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using pump_api.Data;
using pump_api.Dtos.PumpInspection;
using pump_api.Models;
using pump_api.Services.PumpService;
using System.Security.Claims;

namespace pump_api.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class PumpInspectionController : ControllerBase
  {
    private readonly DataContext _context;
    private readonly IPumpService _pumpService;

    public PumpInspectionController(DataContext context, IPumpService pumpService)
    {
      _context = context;
      _pumpService = pumpService;
    }

    [HttpGet("pump/{pumpId}")]
    public async Task<ActionResult<ServiceResponse<List<GetPumpInspectionDto>>>> GetInspectionsByPump(int pumpId)
    {
      var response = new ServiceResponse<List<GetPumpInspectionDto>>();

      try
      {
        var inspections = await _context.PumpInspections
            .Include(pi => pi.Inspector)
            .Where(pi => pi.PumpId == pumpId)
            .OrderByDescending(pi => pi.InspectionDate)
            .Select(pi => new GetPumpInspectionDto
            {
              Id = pi.Id,
              InspectionDate = pi.InspectionDate,
              Notes = pi.Notes,
              PressureReading = pi.PressureReading,
              FlowRateReading = pi.FlowRateReading,
              Status = pi.Status.ToString(),
              IsOperational = pi.IsOperational,
              PumpId = pi.PumpId,
              InspectorName = pi.Inspector.Username
            })
            .ToListAsync();

        response.Data = inspections;
        response.Success = true;
        response.Message = $"Found {inspections.Count} inspections for pump {pumpId}";
      }
      catch (Exception ex)
      {
        response.Success = false;
        response.Message = $"Error retrieving inspections: {ex.Message}";
      }

      return Ok(response);
    }

    [HttpGet("pump/{pumpId}/pressure-history")]
    public async Task<ActionResult<ServiceResponse<List<object>>>> GetPressureHistory(int pumpId, [FromQuery] int days = 30)
    {
      var response = new ServiceResponse<List<object>>();

      try
      {
        var cutoffDate = DateTime.UtcNow.AddDays(-days);

        var pressureHistory = await _context.PumpInspections
            .Where(pi => pi.PumpId == pumpId && pi.InspectionDate >= cutoffDate)
            .OrderBy(pi => pi.InspectionDate)
            .Select(pi => new
            {
              Date = pi.InspectionDate,
              Pressure = pi.PressureReading,
              FlowRate = pi.FlowRateReading,
              IsOperational = pi.IsOperational
            })
            .ToListAsync();

        response.Data = pressureHistory.Cast<object>().ToList();
        response.Success = true;
        response.Message = $"Found {pressureHistory.Count} pressure readings for pump {pumpId}";
      }
      catch (Exception ex)
      {
        response.Success = false;
        response.Message = $"Error retrieving pressure history: {ex.Message}";
      }

      return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<ServiceResponse<GetPumpInspectionDto>>> AddInspection(AddPumpInspectionDto dto)
    {
      var response = new ServiceResponse<GetPumpInspectionDto>();

      try
      {
        // Get current user ID from JWT token
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
        {
          response.Success = false;
          response.Message = "User not authenticated";
          return Unauthorized(response);
        }

        var inspectorId = int.Parse(userIdClaim.Value);

        // Verify pump exists
        var pump = await _context.Pumps.FindAsync(dto.PumpId);
        if (pump == null)
        {
          response.Success = false;
          response.Message = "Pump not found";
          return NotFound(response);
        }

        var inspection = new PumpInspection
        {
          PumpId = dto.PumpId,
          InspectorId = inspectorId,
          InspectionDate = DateTime.UtcNow,
          PressureReading = dto.PressureReading,
          FlowRateReading = dto.FlowRateReading,
          Notes = dto.Notes,
          IsOperational = dto.IsOperational,
          Status = InspectionStatus.Completed
        };

        _context.PumpInspections.Add(inspection);
        await _context.SaveChangesAsync();

        // Get inspector name for response
        var inspector = await _context.Users.FindAsync(inspectorId);

        var result = new GetPumpInspectionDto
        {
          Id = inspection.Id,
          InspectionDate = inspection.InspectionDate,
          Notes = inspection.Notes,
          PressureReading = inspection.PressureReading,
          FlowRateReading = inspection.FlowRateReading,
          Status = inspection.Status.ToString(),
          IsOperational = inspection.IsOperational,
          PumpId = inspection.PumpId,
          InspectorName = inspector?.Username ?? "Unknown"
        };

        response.Data = result;
        response.Success = true;
        response.Message = "Inspection added successfully";
      }
      catch (Exception ex)
      {
        response.Success = false;
        response.Message = $"Error adding inspection: {ex.Message}";
      }

      return Ok(response);
    }
  }
}