using backend.Models.Entities;
using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims; 
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using backend.Models.DTOs;
using Microsoft.Extensions.Caching.Memory;
namespace backend.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly AppDbContext _context;

        public UserController(AppDbContext context, IConfiguration configuration)
        {
            _configuration = configuration;
            _context = context;
        }

       
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto request)
        {
           
            if (await _context.Users.AnyAsync(u => u.Username.ToLower() == request.Username.ToLower()))
            {
                return BadRequest("Bu kullanıcı adı zaten alınmış.");
            }

            
            CreatePasswordHash(request.Password, out string passwordHash, out string passwordSalt);

            var user = new User
            {
                Username = request.Username,
                FullName = request.FullName,
                   Email = request.Email,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            
            return StatusCode(201, new { message = "Kullanıcı başarıyla kaydedildi." });
        }

        
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto request)
        {
            // Kullanıcıyı veritabanından bul
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower());

            if (user == null)
            {
                return Unauthorized("Kullanıcı adı veya şifre hatalı.");
            }

            
            if (!VerifyPasswordHash(request.Password, user.PasswordHash, user.PasswordSalt))
            {
                return Unauthorized("Kullanıcı adı veya şifre hatalı.");
            }

            
            string token = CreateToken(user);

            
            return Ok(new { token });
        }

        

        
        private void CreatePasswordHash(string password, out string passwordHash, out string passwordSalt)
{
    using (var hmac = new HMACSHA512())
    {
        passwordSalt = Convert.ToBase64String(hmac.Key);
        passwordHash = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(password))); 
    }
}

        
        private bool VerifyPasswordHash(string password, string storedHash, string storedSalt)
{
    var saltBytes = Convert.FromBase64String(storedSalt);
    using (var hmac = new HMACSHA512(saltBytes))
    {
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        var storedHashBytes = Convert.FromBase64String(storedHash);
        return computedHash.SequenceEqual(storedHashBytes); 
    }
}
        
       
        private string CreateToken(User user)
        {
           
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
                
            };

            
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            
            
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
            
            
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7), // 7 gün geçerlilik süresi
                signingCredentials: creds
            );

            
            var jwtHandler = new JwtSecurityTokenHandler();
            return jwtHandler.WriteToken(token);
        }
    }
}