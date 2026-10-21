using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace WebApiOrquesta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MediaHomeController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly string cnBD = "";
        private Service.MediaHomeSER objBss;
        private readonly IMapper mapper;

        public MediaHomeController(IConfiguration configuracion, IMapper mapper)
        {
            this._configuration = configuracion;
            this.mapper = mapper;
            this.cnBD = this._configuration.GetConnectionString("cn_bd_orquesta");
        }

        // GET: api/mediahome?tipo=video — medios del home (público)
        [HttpGet]
        [AllowAnonymous]
        public ActionResult<List<DTO.MediaHomeDTO>> getAll([FromQuery] string tipo)
        {
            objBss = new Service.MediaHomeSER(this.cnBD, this.mapper);
            return objBss.getAll(tipo);
        }

        // POST: api/mediahome — agrega un video o foto (admin)
        [HttpPost]
        public ActionResult<DTO.MediaHomeDTO> agregar(DTO.MediaHomeDTO dto)
        {
            objBss = new Service.MediaHomeSER(this.cnBD, this.mapper);
            var result = objBss.agregar(dto);
            if (result.errorCodigo != "OK") return BadRequest(result.errorMensaje);
            return Ok(result.value);
        }

        // PUT: api/mediahome/orden — guarda el nuevo orden de los videos o fotos (admin)
        [HttpPut("orden")]
        public IActionResult cambiarOrden(DTO.MediaOrdenDTO dto)
        {
            objBss = new Service.MediaHomeSER(this.cnBD, this.mapper);
            var result = objBss.cambiarOrden(dto);
            if (result.errorCodigo != "OK") return BadRequest(result.errorMensaje);
            return NoContent();
        }

        // DELETE: api/mediahome/5 — quita un video o foto del home (admin)
        [HttpDelete("{id}")]
        public IActionResult eliminar(int id)
        {
            objBss = new Service.MediaHomeSER(this.cnBD, this.mapper);
            var result = objBss.eliminar(id);
            if (result.errorCodigo == "NOEXISTE") return NotFound();
            return NoContent();
        }
    }
}
