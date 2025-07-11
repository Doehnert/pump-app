namespace pump_api.Exceptions
{
  public class ValidationException : PumpMasterException
  {
    public Dictionary<string, string[]> Errors { get; }

    public ValidationException(string message, Dictionary<string, string[]> errors = null)
        : base(message, "VALIDATION_ERROR", 400)
    {
      Errors = errors ?? new Dictionary<string, string[]>();
    }
  }
}