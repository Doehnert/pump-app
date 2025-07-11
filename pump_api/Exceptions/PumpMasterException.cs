namespace pump_api.Exceptions
{
  public class PumpMasterException : Exception
  {
    public string ErrorCode { get; }
    public int StatusCode { get; }

    public PumpMasterException(string message, string errorCode = "GENERAL_ERROR", int statusCode = 500)
        : base(message)
    {
      ErrorCode = errorCode;
      StatusCode = statusCode;
    }
  }
}