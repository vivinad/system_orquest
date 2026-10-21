using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace WebApiOrquesta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServicioExtraController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly string cnBD = "";
        private Service.ServicioExtraSER objBss;
        private readonly IMapper mapper;

        public ServicioExtraController(IConfiguration configuracion, IMapper mapper)
        {
            this._configuration = configuracion;
            this.mapper = mapper;
            this.cnBD = this._configuration.GetConnectionString("cn_bd_orquesta");
        }

        // GET: api/servicioextra — servicios extra activos (público: lo usa el cotizador)
        [HttpGet]
        [AllowAnonymous]
        public ActionResult<List<DTO.ServicioExtraDTO>> getAll()
        {
            objBss = new Service.ServicioExtraSER(this.cnBD, this.mapper);
            return objBss.getAll();
        }

        // GET: api/servicioextra/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public ActionResult<DTO.ServicioExtraDTO> getById(int id)
        {
            objBss = new Service.ServicioExtraSER(this.cnBD, this.mapper);
            var value = objBss.getById(id);
            if (value == null) return NotFound();
            return value;
        }

        // POST: api/servicioextra (admin)
        [HttpPost]
        public ActionResult<DTO.ServicioExtraDTO> agregar(DTO.ServicioExtraDTO dto)
        {
            objBss = new Service.ServicioExtraSER(this.cnBD, this.mapper);
            var result = objBss.agregar(dto);
            if (result.errorCodigo != "OK") return BadRequest(result.errorMensaje);
            return CreatedAtAction(nameof(getById), new { id = result.value.Id }, result.value);
        }

        // PUT: api/servicioextra/5 (admin)
        [HttpPut("{id}")]
        public IActionResult modificar(int id, DTO.ServicioExtraDTO dto)
        {
            if (id != dto.Id) return BadRequest();

            objBss = new Service.ServicioExtraSER(this.cnBD, this.mapper);
            var result = objBss.modificar(dto);
            if (result.errorCodigo == "NOEXISTE") return NotFound();
            return NoContent();
        }

        // DELETE: api/servicioextra/5 (admin) — no se elimina, solo se desactiva
        [HttpDelete("{id}")]
        public IActionResult eliminar(int id)
        {
            objBss = new Service.ServicioExtraSER(this.cnBD, this.mapper);
            var result = objBss.eliminar(id);
            if (result.errorCodigo == "NOEXISTE") return NotFound();
            return NoContent();
        }
    }
}
