using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_orquesta.Data;
using backend_orquesta.Models;

namespace backend_orquesta.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServicioExtraController : ControllerBase
    {
        private readonly OrquestaDbContext _context;

        public ServicioExtraController(OrquestaDbContext context)
        {
            _context = context;
        }

        // GET: api/servicioextra
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServicioExtra>>> GetServicios()
        {
            return await _context.ServiciosExtra
                .Where(s => s.Activo)
                .ToListAsync();
        }

        // GET: api/servicioextra/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ServicioExtra>> GetServicio(int id)
        {
            var servicio = await _context.ServiciosExtra.FindAsync(id);
            if (servicio == null) return NotFound();
            return servicio;
        }

        // POST: api/servicioextra
        [HttpPost]
        public async Task<ActionResult<ServicioExtra>> CrearServicio(ServicioExtra servicio)
        {
            _context.ServiciosExtra.Add(servicio);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetServicio), new { id = servicio.Id }, servicio);
        }

        // PUT: api/servicioextra/5
        [HttpPut("{id}")]
        public async Task<IActionResult> EditarServicio(int id, ServicioExtra servicio)
        {
            if (id != servicio.Id) return BadRequest();
            _context.Entry(servicio).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/servicioextra/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarServicio(int id)
        {
            var servicio = await _context.ServiciosExtra.FindAsync(id);
            if (servicio == null) return NotFound();
            servicio.Activo = false; // no se elimina, solo se desactiva
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
