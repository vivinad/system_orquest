using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;

namespace WebApiOrquesta.Controllers
{
    // Todo el módulo de finanzas es solo para el admin (requiere token)
    [Route("api/[controller]")]
    [ApiController]
    public class FinanzaController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly string cnBD = "";
        private Service.FinanzaSER objBss;
        private readonly IMapper mapper;

        public FinanzaController(IConfiguration configuracion, IMapper mapper)
        {
            this._configuration = configuracion;
            this.mapper = mapper;
            this.cnBD = this._configuration.GetConnectionString("cn_bd_orquesta");
        }

        // GET: api/finanza
        [HttpGet]
        public ActionResult<List<DTO.FinanzaDTO>> getAll()
        {
            objBss = new Service.FinanzaSER(this.cnBD, this.mapper);
            return objBss.getAll();
        }

        // GET: api/finanza/resumen
        [HttpGet("resumen")]
        public ActionResult<DTO.ResumenFinanzaDTO> getResumen()
        {
            objBss = new Service.FinanzaSER(this.cnBD, this.mapper);
            return objBss.getResumen();
        }

        // GET: api/finanza/resumen/mes?anio=2025&mes=6
        [HttpGet("resumen/mes")]
        public ActionResult<DTO.ResumenFinanzaMesDTO> getResumenMes(int anio, int mes)
        {
            objBss = new Service.FinanzaSER(this.cnBD, this.mapper);
            return objBss.getResumenMes(anio, mes);
        }

        // POST: api/finanza — el adminId se toma del token del admin logueado
        [HttpPost]
        public ActionResult<DTO.FinanzaDTO> agregar(DTO.FinanzaDTO dto)
        {
            int idAdminToken = 0;
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (claim != null) int.TryParse(claim, out idAdminToken);

            objBss = new Service.FinanzaSER(this.cnBD, this.mapper);
            var result = objBss.agregar(dto, idAdminToken);
            if (result.errorCodigo != "OK") return BadRequest(result.errorMensaje);
            return Ok(result.value);
        }

        // PUT: api/finanza/5
        [HttpPut("{id}")]
        public IActionResult modificar(int id, DTO.FinanzaDTO dto)
        {
            if (id != dto.Id) return BadRequest();

            objBss = new Service.FinanzaSER(this.cnBD, this.mapper);
            var result = objBss.modificar(dto);
            if (result.errorCodigo == "VAL") return BadRequest(result.errorMensaje);
            if (result.errorCodigo == "NOEXISTE") return NotFound();
            return NoContent();
        }

        // DELETE: api/finanza/5
        [HttpDelete("{id}")]
        public IActionResult eliminar(int id)
        {
            objBss = new Service.FinanzaSER(this.cnBD, this.mapper);
            var result = objBss.eliminar(id);
            if (result.errorCodigo == "NOEXISTE") return NotFound();
            return NoContent();
        }
    }
}
