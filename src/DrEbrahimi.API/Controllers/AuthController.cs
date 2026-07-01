using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace DrEbrahimi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;

    public AuthController(IConfiguration config)
    {
        _config = config;
    }

    public record LoginRequest(string Username, string Password);
    public record LoginResponse(string Token, string Username, DateTime ExpiresAt);

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest req)
    {
        var adminUser = _config["AdminCredentials:Username"] ?? "admin";
        var adminPass = _config["AdminCredentials:Password"] ?? "admin";

        if (req.Username != adminUser || req.Password != adminPass)
            return Unauthorized(new { message = "نام کاربری یا رمز عبور اشتباه است." });

        var key     = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                          _config["Jwt:Key"] ?? "FallbackKey_ChangeThis_InProduction!!"));
        var creds   = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry  = DateTime.UtcNow.AddHours(
                          double.Parse(_config["Jwt:ExpiryHours"] ?? "8"));

        var token = new JwtSecurityToken(
            issuer:   _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims:   new[] { new Claim(ClaimTypes.Name, req.Username) },
            expires:  expiry,
            signingCredentials: creds
        );

        return Ok(new LoginResponse(
            new JwtSecurityTokenHandler().WriteToken(token),
            req.Username,
            expiry
        ));
    }

    [HttpPost("verify")]
    public IActionResult Verify()
    {
        // This endpoint is protected by [Authorize] - if we reach here token is valid
        return Ok(new { valid = true });
    }
}
