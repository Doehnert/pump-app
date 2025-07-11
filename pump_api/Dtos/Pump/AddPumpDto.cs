using pump_api.Models;

namespace pump_api.Dtos.Pump
{
    public class AddPumpDto
    {
        public string Name { get; set; } = string.Empty;
        public PumpType Type { get; set; } = PumpType.Centrifugal;
        public string Area { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double FlowRate { get; set; }
        public double Offset { get; set; }
        public double CurrentPressure { get; set; }
        public double MinPressure { get; set; }
        public double MaxPressure { get; set; }
    }
}