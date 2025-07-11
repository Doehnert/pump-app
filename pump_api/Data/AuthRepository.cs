using pump_api.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using pump_api.Services;
using pump_api.Dtos.User;

namespace pump_api.Data
{
  public class AuthRepository : IAuthRepository
  {
    private readonly DataContext _context;
    private readonly IConfiguration _configuration;
    private readonly IPasswordValidationService _passwordValidationService;

    public AuthRepository(DataContext context, IConfiguration configuration, IPasswordValidationService passwordValidationService)
    {
      _context = context;
      _configuration = configuration;
      _passwordValidationService = passwordValidationService;
    }

    public async Task<ServiceResponse<TokenResponseDto>> Login(string username, string password)
    {
      var response = new ServiceResponse<TokenResponseDto>();
      var user = await _context.Users.FirstOrDefaultAsync(u => u.Username.ToLower().Equals(username.ToLower()));
      if (user == null)
      {
        response.Success = false;
        response.Message = "User not found.";
      }
      else if (!VerifyPasswordHash(password, user.PasswordHash, user.PasswordSalt))
      {
        response.Success = false;
        response.Message = "Wrong password.";
      }
      else
      {
        var accessToken = CreateToken(user);
        var refreshToken = await CreateRefreshToken(user);

        response.Data = new TokenResponseDto
        {
          AccessToken = accessToken,
          RefreshToken = refreshToken.Token,
          ExpiresAt = DateTime.UtcNow.AddHours(8)
        };
      }

      return response;
    }

    public async Task<ServiceResponse<TokenResponseDto>> Register(User user, string password)
    {
      var response = new ServiceResponse<TokenResponseDto>();

      // Validate password
      var (isValid, errorMessage) = _passwordValidationService.ValidatePassword(password);
      if (!isValid)
      {
        response.Success = false;
        response.Message = errorMessage;
        return response;
      }

      if (await UserExists(user.Username))
      {
        response.Success = false;
        response.Message = "User already exists.";
        return response;
      }

      response.Message = "Registration successful";

      CreatePasswordHash(password, out byte[] passwordHash, out byte[] passwordSalt);

      user.PasswordHash = passwordHash;
      user.PasswordSalt = passwordSalt;

      _context.Users.Add(user);
      await _context.SaveChangesAsync();

      var accessToken = CreateToken(user);
      var refreshToken = await CreateRefreshToken(user);

      response.Data = new TokenResponseDto
      {
        AccessToken = accessToken,
        RefreshToken = refreshToken.Token,
        ExpiresAt = DateTime.UtcNow.AddHours(8)
      };

      return response;
    }

    public async Task<bool> UserExists(string username)
    {
      if (await _context.Users.AnyAsync(u => u.Username.ToLower() == username.ToLower()))
      {
        return true;
      }
      return false;
    }

    private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
    {
      using (var hmac = new HMACSHA512())
      {
        passwordSalt = hmac.Key;
        passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
      }
    }

    private bool VerifyPasswordHash(string password, byte[] passwordHash, byte[] passwordSalt)
    {
      using (var hmac = new HMACSHA512(passwordSalt))
      {
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        return computedHash.SequenceEqual(passwordHash);
      }
    }

    private string CreateToken(User user)
    {
      var claims = new List<Claim>
      {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.Username),
        new Claim(ClaimTypes.Role, user.Role.ToString())
      };
      var appSettingsToken = _configuration.GetSection("AppSettings:Token").Value;
      if (appSettingsToken == null)
      {
        throw new Exception("AppSettings Token is null!");
      }
      var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(appSettingsToken));
      var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
      var tokenDescriptor = new SecurityTokenDescriptor
      {
        Subject = new ClaimsIdentity(claims),
        Expires = DateTime.Now.AddHours(8),
        SigningCredentials = creds
      };
      var tokenHandler = new JwtSecurityTokenHandler();
      var token = tokenHandler.CreateToken(tokenDescriptor);
      return tokenHandler.WriteToken(token);
    }

    private async Task<RefreshToken> CreateRefreshToken(User user)
    {
      var refreshToken = new RefreshToken
      {
        Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
        ExpiresAt = DateTime.UtcNow.AddDays(7),
        UserId = user.Id
      };

      _context.RefreshTokens.Add(refreshToken);
      await _context.SaveChangesAsync();
      return refreshToken;
    }

    public async Task<ServiceResponse<TokenResponseDto>> RefreshToken(string refreshToken)
    {
      var response = new ServiceResponse<TokenResponseDto>();

      var storedToken = await _context.RefreshTokens
          .Include(rt => rt.User)
          .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

      if (storedToken == null)
      {
        response.Success = false;
        response.Message = "Invalid refresh token.";
        return response;
      }

      if (storedToken.IsExpired)
      {
        response.Success = false;
        response.Message = "Refresh token has expired.";
        return response;
      }

      if (storedToken.IsRevoked)
      {
        response.Success = false;
        response.Message = "Refresh token has been revoked.";
        return response;
      }

      // Revoke the current refresh token
      storedToken.RevokedAt = DateTime.UtcNow;
      storedToken.ReplacedByToken = "refreshed";

      // Create new tokens
      var newAccessToken = CreateToken(storedToken.User);
      var newRefreshToken = await CreateRefreshToken(storedToken.User);

      await _context.SaveChangesAsync();

      response.Data = new TokenResponseDto
      {
        AccessToken = newAccessToken,
        RefreshToken = newRefreshToken.Token,
        ExpiresAt = DateTime.UtcNow.AddHours(8)
      };

      return response;
    }

    public async Task<ServiceResponse<string>> RevokeRefreshToken(string refreshToken)
    {
      var response = new ServiceResponse<string>();

      var storedToken = await _context.RefreshTokens
          .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

      if (storedToken == null)
      {
        response.Success = false;
        response.Message = "Invalid refresh token.";
        return response;
      }

      storedToken.RevokedAt = DateTime.UtcNow;
      storedToken.ReasonRevoked = "User logout";

      await _context.SaveChangesAsync();

      response.Data = "Token revoked successfully.";
      return response;
    }
  }
}