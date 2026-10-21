using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace WebApiOrquesta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CotizacionController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _env;
        private readonly string cnBD = "";
        private Service.CotizacionSER objBss;
        private readonly IMapper mapper;

        public CotizacionController(IConfiguration configuracion, IMapper mapper, IWebHostEnvironment env)
        {
            this._configuration = configuracion;
            this.mapper = mapper;
            this._env = env;
            this.cnBD = this._configuration.GetConnectionString("cn_bd_orquesta");
        }

        // POST: api/cotizacion/calcular — previsualizar el precio (público, no guarda nada)
        [HttpPost("calcular")]
        [AllowAnonymous]
        public ActionResult<DTO.CotizacionResultadoDTO> calcular(DTO.CotizacionRequestDTO req)
        {
            objBss = new Service.CotizacionSER(this.cnBD, this.mapper);
            var result = objBss.calcular(req);
            if (result.errorCodigo != "OK") return BadRequest(new { mensaje = result.errorMensaje });
            return result.value;
        }

        // GET: api/cotizacion/fecha-ocupada?fecha=2026-07-15 (público)
        [HttpGet("fecha-ocupada")]
        [AllowAnonymous]
        public IActionResult fechaOcupada(string fecha)
        {
            objBss = new Service.CotizacionSER(this.cnBD, this.mapper);
            var result = objBss.fechaOcupada(fecha);
            if (result.errorCodigo != "OK") return BadRequest(new { mensaje = result.errorMensaje });
            return Ok(new { ocupada = result.value });
        }

        // POST: api/cotizacion — crear la cotización en estado 'pendiente' (público)
        [HttpPost]
        [AllowAnonymous]
        public ActionResult<DTO.CotizacionDTO> crear(DTO.CotizacionRequestDTO req)
        {
            objBss = new Service.CotizacionSER(this.cnBD, this.mapper);
            var result = objBss.crear(req);
            if (result.errorCodigo == "CONFLICTO") return Conflict(new { mensaje = result.errorMensaje });
            if (result.errorCodigo != "OK") return BadRequest(new { mensaje = result.errorMensaje });
            return CreatedAtAction(nameof(getById), new { id = result.value.Id }, result.value);
        }

        // GET: api/cotizacion?estado=pendiente — listado (admin)
        [HttpGet]
        public ActionResult<List<DTO.CotizacionDTO>> getAll([FromQuery] string estado)
        {
            objBss = new Service.CotizacionSER(this.cnBD, this.mapper);
            return objBss.getAll(estado);
        }

        // GET: api/cotizacion/5 (admin)
        [HttpGet("{id}")]
        public ActionResult<DTO.CotizacionDTO> getById(int id)
        {
            objBss = new Service.CotizacionSER(this.cnBD, this.mapper);
            var value = objBss.getById(id);
            if (value == null) return NotFound();
            return value;
        }

        // GET: api/cotizacion/5/contrato?codigo=... — genera el contrato PDF con los datos actuales.
        // El cliente lo descarga al terminar de cotizar con el código que recibió al crearla;
        // el admin con sesión iniciada no necesita código.
        [HttpGet("{id}/contrato")]
        [AllowAnonymous]
        public IActionResult getContrato(int id, [FromQuery] Guid? codigo)
        {
            bool esAdmin = User.Identity != null && User.Identity.IsAuthenticated;

            objBss = new Service.CotizacionSER(this.cnBD, this.mapper);
            var result = objBss.obtenerContrato(id, codigo, esAdmin, _env.ContentRootPath);
            if (result.errorCodigo == "NOEXISTE") return NotFound();
            return File(result.value, "application/pdf", $"Contrato-{id}.pdf");
        }

        // PUT: api/cotizacion/5 — el admin edita los datos y/o fija el monto acordado
        [HttpPut("{id}")]
        public ActionResult<DTO.CotizacionDTO> actualizar(int id, DTO.CotizacionEdicionDTO dto)
        {
            objBss = new Service.CotizacionSER(this.cnBD, this.mapper);
            var result = objBss.actualizar(id, dto);
            if (result.errorCodigo == "NOEXISTE") return NotFound();
            if (result.errorCodigo != "OK") return BadRequest(new { mensaje = result.errorMensaje });
            return result.value;
        }

        // PUT: api/cotizacion/5/estado — el admin confirma/rechaza/marca pagada
        [HttpPut("{id}/estado")]
        public IActionResult cambiarEstado(int id, DTO.CambioEstadoDTO dto)
        {
            objBss = new Service.CotizacionSER(this.cnBD, this.mapper);
            var result = objBss.cambiarEstado(id, dto);
            if (result.errorCodigo == "NOEXISTE") return NotFound();
            return NoContent();
        }
    }
}
