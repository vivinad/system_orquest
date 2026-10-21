using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace WebApiOrquesta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MusicoAdicionalController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly string cnBD = "";
        private Service.MusicoAdicionalSER objBss;
        private readonly IMapper mapper;

        public MusicoAdicionalController(IConfiguration configuracion, IMapper mapper)
        {
            this._configuration = configuracion;
            this.mapper = mapper;
            this.cnBD = this._configuration.GetConnectionString("cn_bd_orquesta");
        }

        // GET: api/musicoadicional — músicos adicionales activos (público: lo usa el cotizador)
        [HttpGet]
        [AllowAnonymous]
        public ActionResult<List<DTO.MusicoAdicionalDTO>> getAll()
        {
            objBss = new Service.MusicoAdicionalSER(this.cnBD, this.mapper);
            return objBss.getAll();
        }

        // GET: api/musicoadicional/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public ActionResult<DTO.MusicoAdicionalDTO> getById(int id)
        {
            objBss = new Service.MusicoAdicionalSER(this.cnBD, this.mapper);
            var value = objBss.getById(id);
            if (value == null) return NotFound();
            return value;
        }

        // POST: api/musicoadicional (admin)
        [HttpPost]
        public ActionResult<DTO.MusicoAdicionalDTO> agregar(DTO.MusicoAdicionalDTO dto)
        {
            objBss = new Service.MusicoAdicionalSER(this.cnBD, this.mapper);
            var result = objBss.agregar(dto);
            if (result.errorCodigo != "OK") return BadRequest(result.errorMensaje);
            return CreatedAtAction(nameof(getById), new { id = result.value.Id }, result.value);
        }

        // PUT: api/musicoadicional/5 (admin)
        [HttpPut("{id}")]
        public IActionResult modificar(int id, DTO.MusicoAdicionalDTO dto)
        {
            if (id != dto.Id) return BadRequest();

            objBss = new Service.MusicoAdicionalSER(this.cnBD, this.mapper);
            var result = objBss.modificar(dto);
            if (result.errorCodigo == "NOEXISTE") return NotFound();
            return NoContent();
        }

        // DELETE: api/musicoadicional/5 (admin) — no se elimina, solo se desactiva
        [HttpDelete("{id}")]
        public IActionResult eliminar(int id)
        {
            objBss = new Service.MusicoAdicionalSER(this.cnBD, this.mapper);
            var result = objBss.eliminar(id);
            if (result.errorCodigo == "NOEXISTE") return NotFound();
            return NoContent();
        }
    }
}
