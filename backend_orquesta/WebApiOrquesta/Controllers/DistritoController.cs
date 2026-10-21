using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace WebApiOrquesta.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DistritoController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly string cnBD = "";
        private Service.DistritoSER objBss;
        private readonly IMapper mapper;

        public DistritoController(IConfiguration configuracion, IMapper mapper)
        {
            this._configuration = configuracion;
            this.mapper = mapper;
            this.cnBD = this._configuration.GetConnectionString("cn_bd_orquesta");
        }

        // GET: api/distrito (público)
        [HttpGet]
        [AllowAnonymous]
        public ActionResult<List<DTO.DistritoDTO>> getAll()
        {
            objBss = new Service.DistritoSER(this.cnBD, this.mapper);
            return objBss.getAll();
        }

        // GET: api/distrito/5 (público)
        [HttpGet("{id}")]
        [AllowAnonymous]
        public ActionResult<DTO.DistritoDTO> getById(int id)
        {
            objBss = new Service.DistritoSER(this.cnBD, this.mapper);
            var value = objBss.getById(id);
            if (value == null) return NotFound();
            return value;
        }

        // PUT: api/distrito/5 — el admin puede ajustar el costo de movilidad
        [HttpPut("{id}")]
        public IActionResult modificar(int id, DTO.DistritoDTO dto)
        {
            if (id != dto.Id) return BadRequest();

            objBss = new Service.DistritoSER(this.cnBD, this.mapper);
            var result = objBss.modificar(dto);
            if (result.errorCodigo == "NOEXISTE") return NotFound();
            return NoContent();
        }
    }
}
