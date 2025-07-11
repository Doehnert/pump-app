using Microsoft.AspNetCore.Mvc;
using pump_api.Data;
using pump_api.Models;

namespace pump_api.Controllers
{
  [ApiController]
  [Route("api/dev")]
  public class DevController : ControllerBase
  {
    private readonly DataContext _context;
    private readonly IWebHostEnvironment _environment;

    public DevController(DataContext context, IWebHostEnvironment environment)
    {
      _context = context;
      _environment = environment;
    }

    // POST: api/dev/seed
    [HttpPost("seed")]
    public async Task<IActionResult> SeedData()
    {
      // Only allow in development
      if (!_environment.IsDevelopment())
      {
        return NotFound();
      }

      try
      {
        await DatabaseSeeder.SeedDataAsync(_context);

        // Get final counts
        var stats = new
        {
          Users = await _context.Users.CountAsync(),
          Pumps = await _context.Pumps.CountAsync(),
          Inspections = await _context.PumpInspections.CountAsync()
        };

        return Ok(new
        {
          message = "Database seeded successfully!",
          stats = stats
        });
      }
      catch (Exception ex)
      {
        return BadRequest(new { message = $"Error seeding database: {ex.Message}" });
      }
    }

    // POST: api/dev/seed-users
    [HttpPost("seed-users")]
    public async Task<IActionResult> SeedUsers()
    {
      if (!_environment.IsDevelopment())
      {
        return NotFound();
      }

      try
      {
        await DatabaseSeeder.SeedUsersOnlyAsync(_context);
        return Ok(new { message = "Users seeded successfully!" });
      }
      catch (Exception ex)
      {
        return BadRequest(new { message = $"Error seeding users: {ex.Message}" });
      }
    }

    // POST: api/dev/seed-pumps
    [HttpPost("seed-pumps")]
    public async Task<IActionResult> SeedPumps()
    {
      if (!_environment.IsDevelopment())
      {
        return NotFound();
      }

      try
      {
        await DatabaseSeeder.SeedPumpsOnlyAsync(_context);
        return Ok(new { message = "Pumps seeded successfully!" });
      }
      catch (Exception ex)
      {
        return BadRequest(new { message = $"Error seeding pumps: {ex.Message}" });
      }
    }

    // DELETE: api/dev/clear
    [HttpDelete("clear")]
    public async Task<IActionResult> ClearData()
    {
      if (!_environment.IsDevelopment())
      {
        return NotFound();
      }

      try
      {
        await DatabaseSeeder.ClearAllDataAsync(_context);
        return Ok(new { message = "Database cleared successfully!" });
      }
      catch (Exception ex)
      {
        return BadRequest(new { message = $"Error clearing database: {ex.Message}" });
      }
    }

    // GET: api/dev/stats
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
      if (!_environment.IsDevelopment())
      {
        return NotFound();
      }

      var stats = new
      {
        Users = await _context.Users.CountAsync(),
        Pumps = await _context.Pumps.CountAsync(),
        Inspections = await _context.PumpInspections.CountAsync()
      };

      return Ok(stats);
    }
  }
}