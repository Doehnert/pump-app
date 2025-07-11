namespace pump_api.Exceptions
{
  public class NotFoundException : PumpMasterException
  {
    public NotFoundException(string message)
        : base(message, "NOT_FOUND", 404)
    {
    }
  }
}