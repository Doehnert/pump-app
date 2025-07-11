using System.ComponentModel.DataAnnotations;

namespace pump_api.Dtos.PumpInspection
{
  public class AddPumpInspectionDto
  {
    [Required]
    public int PumpId { get; set; }

    [Required]
    public double PressureReading { get; set; }

    [Required]
    public double FlowRateReading { get; set; }

    public string? Notes { get; set; }

    [Required]
    public bool IsOperational { get; set; }
  }
}