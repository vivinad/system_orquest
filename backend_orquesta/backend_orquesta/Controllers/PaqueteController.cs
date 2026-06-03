using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_orquesta.Data;
using backend_orquesta.Models;

namespace backend_orquesta.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaqueteController : ControllerBase
    {
        private readonly OrquestaDbContext _context;

        public PaqueteController(OrquestaDbContext context)
        {
            _context = context;
        }

        // GET: api/paquete
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Paquete>>> GetPaquetes()
        {
            return await _context.Paquetes
                .Where(p => p.Activo)
                .ToListAsync();
        }

        // GET: api/paquete/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Paquete>> GetPaquete(int id)
        {
            var paquete = await _context.Paquetes.FindAsync(id);
            if (paquete == null) return NotFound();
            return paquete;
        }

        // POST: api/paquete
        [HttpPost]
        public async Task<ActionResult<Paquete>> CrearPaquete(Paquete paquete)
        {
            _context.Paquetes.Add(paquete);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPaquete), new { id = paquete.Id }, paquete);
        }

        // PUT: api/paquete/5
        [HttpPut("{id}")]
        public async Task<IActionResult> EditarPaquete(int id, Paquete paquete)
        {
            if (id != paquete.Id) return BadRequest();
            _context.Entry(paquete).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/paquete/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarPaquete(int id)
        {
            var paquete = await _context.Paquetes.FindAsync(id);
            if (paquete == null) return NotFound();
            paquete.Activo = false; // no se elimina, solo se desactiva
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}