using System.ComponentModel.DataAnnotations;

namespace pump_api.Models
{
  public class PumpInspection
  {
    public int Id { get; set; }

    [Required]
    public DateTime InspectionDate { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }

    [Required]
    public double PressureReading { get; set; }

    [Required]
    public double FlowRateReading { get; set; }

    [Required]
    public InspectionStatus Status { get; set; } = InspectionStatus.Completed;

    [Required]
    public bool IsOperational { get; set; }

    // Navigation property for the pump being inspected
    public int PumpId { get; set; }
    public Pump Pump { get; set; } = null!;

    // Navigation property for the user performing the inspection
    public int InspectorId { get; set; }
    public User Inspector { get; set; } = null!;
  }
}