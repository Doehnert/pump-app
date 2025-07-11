using System.ComponentModel.DataAnnotations;

namespace pump_api.Models
{
  public class Pump
  {
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public PumpType Type { get; set; } = PumpType.Centrifugal;

    [Required]
    [StringLength(100)]
    public string Area { get; set; } = string.Empty;

    [Required]
    public double Latitude { get; set; }

    [Required]
    public double Longitude { get; set; }

    [Required]
    public double FlowRate { get; set; }

    [Required]
    public double Offset { get; set; }

    [Required]
    public double CurrentPressure { get; set; }

    [Required]
    public double MinPressure { get; set; }

    [Required]
    public double MaxPressure { get; set; }

    // Timestamp of the last update
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    // Navigation property for the user who owns this pump
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    // Navigation property for pump inspections
    public List<PumpInspection> Inspections { get; set; } = new List<PumpInspection>();
  }
}