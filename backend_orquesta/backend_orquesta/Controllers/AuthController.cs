using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend_orquesta.Data;

namespace backend_orquesta.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly OrquestaDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(OrquestaDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var usuario = await _context.UsuariosAdmin
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.Activo);

            if (usuario == null) return Unauthorized(new { mensaje = "Credenciales incorrectas" });

            bool passwordValido = BCrypt.Net.BCrypt.Verify(request.Password, usuario.PasswordHash);
            if (!passwordValido) return Unauthorized(new { mensaje = "Credenciales incorrectas" });

            var token = GenerarToken(usuario.Id, usuario.Email, usuario.Rol);

            return Ok(new
            {
                token,
                nombre = usuario.Nombre,
                rol = usuario.Rol
            });
        }

        // POST: api/auth/seed — crea el primer admin (solo si no existe ninguno)
        [HttpPost("seed")]
        public async Task<IActionResult> Seed([FromBody] SeedRequest request)
        {
            var yaExiste = await _context.UsuariosAdmin.AnyAsync();
            if (yaExiste) return BadRequest(new { mensaje = "Ya existe un administrador." });

            var usuario = new Models.UsuarioAdmin
            {
                Nombre = request.Nombre,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Rol = "admin",
                Activo = true,
                FechaCreacion = DateTime.Now,
            };

            _context.UsuariosAdmin.Add(usuario);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Administrador creado.", usuario.Id, usuario.Email });
        }

        private string GenerarToken(int id, string email, string rol)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, id.ToString()),
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Role, rol)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(8),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class SeedRequest
    {
        public string Nombre { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}