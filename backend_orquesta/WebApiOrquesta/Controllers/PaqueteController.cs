using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace WebApiOrquesta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaqueteController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly string cnBD = "";
        private Service.PaqueteSER objBss;
        private readonly IMapper mapper;

        public PaqueteController(IConfiguration configuracion, IMapper mapper)
        {
            this._configuration = configuracion;
            this.mapper = mapper;
            this.cnBD = this._configuration.GetConnectionString("cn_bd_orquesta");
        }

        // GET: api/paquete — paquetes activos (público: lo usa el cotizador)
        [HttpGet]
        [AllowAnonymous]
        public ActionResult<List<DTO.PaqueteDTO>> getAll()
        {
            objBss = new Service.PaqueteSER(this.cnBD, this.mapper);
            return objBss.getAll();
        }

        // GET: api/paquete/ocultos — paquetes desactivados, para restaurarlos (admin)
        [HttpGet("ocultos")]
        public ActionResult<List<DTO.PaqueteDTO>> getOcultos()
        {
            objBss = new Service.PaqueteSER(this.cnBD, this.mapper);
            return objBss.getOcultos();
        }

        // GET: api/paquete/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public ActionResult<DTO.PaqueteDTO> getById(int id)
        {
            objBss = new Service.PaqueteSER(this.cnBD, this.mapper);
            var value = objBss.getById(id);
            if (value == null) return NotFound();
            return value;
        }

        // POST: api/paquete (admin)
        [HttpPost]
        public ActionResult<DTO.PaqueteDTO> agregar(DTO.PaqueteDTO dto)
        {
            objBss = new Service.PaqueteSER(this.cnBD, this.mapper);
            var result = objBss.agregar(dto);
            if (result.errorCodigo != "OK") return BadRequest(result.errorMensaje);
            return CreatedAtAction(nameof(getById), new { id = result.value.Id }, result.value);
        }

        // PUT: api/paquete/5 (admin)
        [HttpPut("{id}")]
        public IActionResult modificar(int id, DTO.PaqueteDTO dto)
        {
            if (id != dto.Id) return BadRequest();

            objBss = new Service.PaqueteSER(this.cnBD, this.mapper);
            var result = objBss.modificar(dto);
            if (result.errorCodigo == "NOEXISTE") return NotFound();
            return NoContent();
        }

        // DELETE: api/paquete/5 (admin) — no se elimina, solo se desactiva
        [HttpDelete("{id}")]
        public IActionResult eliminar(int id)
        {
            objBss = new Service.PaqueteSER(this.cnBD, this.mapper);
            var result = objBss.eliminar(id);
            if (result.errorCodigo == "NOEXISTE") return NotFound();
            return NoContent();
        }
    }
}
