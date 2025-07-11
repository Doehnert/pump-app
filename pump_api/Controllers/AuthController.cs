using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using pump_api.Data;
using pump_api.Dtos.User;
using pump_api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace pump_api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _authRepo;
        public AuthController(IAuthRepository authRepo)
        {
            _authRepo = authRepo;

        }

        [HttpPost("Register")]
        public async Task<ActionResult<ServiceResponse<TokenResponseDto>>> Register(UserRegisterDto request)
        {
            var response = await _authRepo.Register(
                new User { Username = request.username }, request.password
            );
            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        [HttpPost("Login")]
        public async Task<ActionResult<ServiceResponse<TokenResponseDto>>> Login(UserLoginDto request)
        {
            var response = await _authRepo.Login(
                    request.Username, request.Password
            );
            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        [HttpPost("Refresh")]
        public async Task<ActionResult<ServiceResponse<TokenResponseDto>>> RefreshToken(RefreshTokenRequestDto request)
        {
            var response = await _authRepo.RefreshToken(request.RefreshToken);
            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        [HttpPost("Revoke")]
        [Authorize]
        public async Task<ActionResult<ServiceResponse<string>>> RevokeToken(RefreshTokenRequestDto request)
        {
            var response = await _authRepo.RevokeRefreshToken(request.RefreshToken);
            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }
    }
}
