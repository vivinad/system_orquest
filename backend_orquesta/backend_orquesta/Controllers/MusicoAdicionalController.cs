using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_orquesta.Data;
using backend_orquesta.Models;

namespace backend_orquesta.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MusicoAdicionalController : ControllerBase
    {
        private readonly OrquestaDbContext _context;

        public MusicoAdicionalController(OrquestaDbContext context)
        {
            _context = context;
        }

        // GET: api/musicoadicional
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MusicoAdicional>>> GetMusicos()
        {
            return await _context.MusicosAdicionales
                .Where(m => m.Activo)
                .ToListAsync();
        }

        // GET: api/musicoadicional/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MusicoAdicional>> GetMusico(int id)
        {
            var musico = await _context.MusicosAdicionales.FindAsync(id);
            if (musico == null) return NotFound();
            return musico;
        }

        // POST: api/musicoadicional
        [HttpPost]
        public async Task<ActionResult<MusicoAdicional>> CrearMusico(MusicoAdicional musico)
        {
            _context.MusicosAdicionales.Add(musico);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetMusico), new { id = musico.Id }, musico);
        }

        // PUT: api/musicoadicional/5
        [HttpPut("{id}")]
        public async Task<IActionResult> EditarMusico(int id, MusicoAdicional musico)
        {
            if (id != musico.Id) return BadRequest();
            _context.Entry(musico).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/musicoadicional/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarMusico(int id)
        {
            var musico = await _context.MusicosAdicionales.FindAsync(id);
            if (musico == null) return NotFound();
            musico.Activo = false;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}