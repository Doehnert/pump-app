namespace pump_api.Dtos.PumpInspection
{
  public class GetPumpInspectionDto
  {
    public int Id { get; set; }
    public DateTime InspectionDate { get; set; }
    public string? Notes { get; set; }
    public double PressureReading { get; set; }
    public double FlowRateReading { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsOperational { get; set; }
    public int PumpId { get; set; }
    public string InspectorName { get; set; } = string.Empty;
  }
}