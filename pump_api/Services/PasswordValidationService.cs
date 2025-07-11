using System.Text.RegularExpressions;

namespace pump_api.Services
{
  public interface IPasswordValidationService
  {
    (bool isValid, string errorMessage) ValidatePassword(string password);
  }

  public class PasswordValidationService : IPasswordValidationService
  {
    public (bool isValid, string errorMessage) ValidatePassword(string password)
    {
      if (string.IsNullOrWhiteSpace(password))
        return (false, "Password cannot be empty.");

      if (password.Length < 8)
        return (false, "Password must be at least 8 characters long.");

      if (password.Length > 128)
        return (false, "Password cannot exceed 128 characters.");

      if (!Regex.IsMatch(password, @"[A-Z]"))
        return (false, "Password must contain at least one uppercase letter.");

      if (!Regex.IsMatch(password, @"[a-z]"))
        return (false, "Password must contain at least one lowercase letter.");

      if (!Regex.IsMatch(password, @"\d"))
        return (false, "Password must contain at least one number.");

      if (!Regex.IsMatch(password, @"[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]"))
        return (false, "Password must contain at least one special character.");

      return (true, string.Empty);
    }
  }
}