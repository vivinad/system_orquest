using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace WebApiOrquesta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventoController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly string cnBD = "";
        private Service.EventoSER objBss;
        private readonly IMapper mapper;

        public EventoController(IConfiguration configuracion, IMapper mapper)
        {
            this._configuration = configuracion;
            this.mapper = mapper;
            this.cnBD = this._configuration.GetConnectionString("cn_bd_orquesta");
        }

        // GET: api/evento — todos los activos (admin)
        [HttpGet]
        public ActionResult<List<DTO.EventoDTO>> getAll()
        {
            objBss = new Service.EventoSER(this.cnBD, this.mapper);
            return objBss.getAll();
        }

        // GET: api/evento/ocultos — eventos quitados, para restaurarlos (admin)
        [HttpGet("ocultos")]
        public ActionResult<List<DTO.EventoDTO>> getOcultos()
        {
            objBss = new Service.EventoSER(this.cnBD, this.mapper);
            return objBss.getOcultos();
        }

        // GET: api/evento/vigentes — solo los que aún no pasan (página pública)
        [HttpGet("vigentes")]
        [AllowAnonymous]
        public ActionResult<List<DTO.EventoDTO>> getVigentes()
        {
            objBss = new Service.EventoSER(this.cnBD, this.mapper);
            return objBss.getVigentes();
        }

        // GET: api/evento/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public ActionResult<DTO.EventoDTO> getById(int id)
        {
            objBss = new Service.EventoSER(this.cnBD, this.mapper);
            var value = objBss.getById(id);
            if (value == null) return NotFound();
            return value;
        }

        // POST: api/evento (admin)
        [HttpPost]
        public ActionResult<DTO.EventoDTO> agregar(DTO.EventoDTO dto)
        {
            objBss = new Service.EventoSER(this.cnBD, this.mapper);
            var result = objBss.agregar(dto);
            if (result.errorCodigo != "OK") return BadRequest(result.errorMensaje);
            return CreatedAtAction(nameof(getById), new { id = result.value.Id }, result.value);
        }

        // PUT: api/evento/5 (admin)
        [HttpPut("{id}")]
        public IActionResult modificar(int id, DTO.EventoDTO dto)
        {
            if (id != dto.Id) return BadRequest();

            objBss = new Service.EventoSER(this.cnBD, this.mapper);
            var result = objBss.modificar(dto);
            if (result.errorCodigo == "NOEXISTE") return NotFound();
            return NoContent();
        }

        // DELETE: api/evento/5 (admin) — no se elimina, solo se desactiva
        [HttpDelete("{id}")]
        public IActionResult eliminar(int id)
        {
            objBss = new Service.EventoSER(this.cnBD, this.mapper);
            var result = objBss.eliminar(id);
            if (result.errorCodigo == "NOEXISTE") return NotFound();
            return NoContent();
        }
    }
}
