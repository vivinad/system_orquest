using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace WebApiOrquesta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly string cnBD = "";
        private Service.UsuarioAdminSER objBss;
        private readonly IMapper mapper;
        private readonly IWebHostEnvironment _env;

        public AuthController(IConfiguration configuracion, IMapper mapper, IWebHostEnvironment env)
        {
            this._configuration = configuracion;
            this.mapper = mapper;
            this._env = env;
            this.cnBD = this._configuration.GetConnectionString("cn_bd_orquesta");
        }

        // POST: api/auth/login
        [HttpPost("login")]
        [AllowAnonymous]
        public ActionResult<DTO.Result.LoginResponseDTO> login([FromBody] DTO.LoginDTO dto)
        {
            var tokenSesion = new Service.TokenSesionSER(
                this._configuration["Jwt:Key"],
                this._configuration["Jwt:Issuer"],
                this._configuration["Jwt:Audience"]);

            objBss = new Service.UsuarioAdminSER(this.cnBD, this.mapper);
            var result = objBss.login(dto, tokenSesion);
            if (result.errorCodigo != "OK") return Unauthorized(new { mensaje = result.errorMensaje });
            return result.value;
        }

        // POST: api/auth/restablecer-clave — cambia la clave de un admin olvidada.
        // SOLO funciona en desarrollo (perfil http/https de Visual Studio) y desde la misma PC;
        // en cualquier otro caso responde 404 como si no existiera.
        [HttpPost("restablecer-clave")]
        [AllowAnonymous]
        public IActionResult restablecerClave([FromBody] DTO.RestablecerClaveDTO dto)
        {
            var ip = HttpContext.Connection.RemoteIpAddress;
            if (!_env.IsDevelopment() || ip == null || !IPAddress.IsLoopback(ip)) return NotFound();

            objBss = new Service.UsuarioAdminSER(this.cnBD, this.mapper);
            var result = objBss.restablecerClave(dto);
            if (result.errorCodigo == "NOEXISTE") return NotFound(new { mensaje = result.errorMensaje });
            if (result.errorCodigo != "OK") return BadRequest(new { mensaje = result.errorMensaje });
            return Ok(new { mensaje = "Clave actualizada. Ya puedes iniciar sesión.", email = result.value });
        }

        // POST: api/auth/seed — crea el primer admin (solo si no existe ninguno)
        [HttpPost("seed")]
        [AllowAnonymous]
        public IActionResult seed([FromBody] DTO.SeedAdminDTO dto)
        {
            objBss = new Service.UsuarioAdminSER(this.cnBD, this.mapper);
            var result = objBss.crearPrimerAdmin(dto);
            if (result.errorCodigo != "OK") return BadRequest(new { mensaje = result.errorMensaje });
            return Ok(new { mensaje = "Administrador creado.", id = result.value, email = dto.Email });
        }
    }
}
