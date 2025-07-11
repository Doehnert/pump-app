using pump_api.Models;
using pump_api.Dtos.User;

namespace pump_api.Data
{
  public interface IAuthRepository
  {
    Task<ServiceResponse<TokenResponseDto>> Register(User user, string password);
    Task<ServiceResponse<TokenResponseDto>> Login(string username, string password);
    Task<ServiceResponse<TokenResponseDto>> RefreshToken(string refreshToken);
    Task<ServiceResponse<string>> RevokeRefreshToken(string refreshToken);
    Task<bool> UserExists(string username);
  }
}