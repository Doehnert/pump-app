namespace pump_api.Dtos.User
{
  public class TokenResponseDto
  {
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
  }

  public class RefreshTokenRequestDto
  {
    public string RefreshToken { get; set; } = string.Empty;
  }
}