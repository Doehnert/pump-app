using Microsoft.AspNetCore.Mvc;
using pump_api.Models;
using pump_api.Data;
using pump_api.Exceptions;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using pump_api.Services.PumpService;
using pump_api.Dtos.Pump;
using Microsoft.AspNetCore.Authorization;

namespace pump_api.Controllers
{
  [Authorize]
  [ApiController]
  [Route("api/[controller]")]
  public class PumpController : ControllerBase
  {
    private readonly IPumpService _pumpService;

    public PumpController(IPumpService pumpService)
    {
      _pumpService = pumpService;
    }

    // GET: api/pump
    [HttpGet]
    [Authorize(Roles = "Admin,FarmManager,Technician,Inspector")]
    public async Task<ActionResult<PaginatedResult<GetPumpDto>>> GetPumps([FromQuery] QueryParameters parameters)
    {
      int userId = int.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)!.Value);
      var response = await _pumpService.GetAllPumps(userId, parameters);
      if (response.Success)
      {
        return Ok(response.Data);
      }
      return BadRequest(response.Message);
    }

    // GET: api/pump/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<GetPumpDto>> GetPump(int id)
    {
      int userId = int.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)!.Value);
      var response = await _pumpService.GetPumpById(id, userId);
      if (response.Success)
      {
        return Ok(response.Data);
      }
      return NotFound(response.Message);
    }

    // POST: api/pump
    [HttpPost]
    [Authorize(Roles = "Admin,FarmManager")]
    public async Task<ActionResult<GetPumpDto>> CreatePump([FromBody] AddPumpDto pump)
    {
      int userId = int.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)!.Value);
      var response = await _pumpService.AddPump(pump, userId);
      if (response.Success)
      {
        return Ok(response.Data);
      }
      return BadRequest(response.Message);
    }

    // PUT: api/pump/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,FarmManager,Technician")]
    public async Task<IActionResult> UpdatePump(int id, [FromBody] UpdatePumpDto pump)
    {
      int userId = int.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)!.Value);
      var response = await _pumpService.UpdatePump(pump, id, userId);
      if (response.Success)
      {
        return Ok(response.Data);
      }
      return BadRequest(response.Message);
    }

    // DELETE: api/pump/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeletePump(int id)
    {
      int userId = int.Parse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)!.Value);
      var response = await _pumpService.DeletePump(id, userId);
      if (response.Success)
      {
        return Ok(response.Data);
      }
      return BadRequest(response.Message);
    }

  }
}