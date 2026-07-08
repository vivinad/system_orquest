using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_orquesta.Data;
using backend_orquesta.Models;

namespace backend_orquesta.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventoController : ControllerBase
    {
        private readonly OrquestaDbContext _context;

        public EventoController(OrquestaDbContext context)
        {
            _context = context;
        }

        // GET: api/evento — todos los activos (para el admin)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Evento>>> GetEventos()
        {
            return await _context.Eventos
                .Where(e => e.Activo)
                .OrderBy(e => e.Fecha)
                .ToListAsync();
        }

        // GET: api/evento/vigentes — solo los que aún no pasan (para la página pública)
        [HttpGet("vigentes")]
        public async Task<ActionResult<IEnumerable<Evento>>> GetEventosVigentes()
        {
            var hoy = DateTime.Today;
            return await _context.Eventos
                .Where(e => e.Activo && e.Fecha >= hoy)
                .OrderBy(e => e.Fecha)
                .ToListAsync();
        }

        // GET: api/evento/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Evento>> GetEvento(int id)
        {
            var evento = await _context.Eventos.FindAsync(id);
            if (evento == null) return NotFound();
            return evento;
        }

        // POST: api/evento
        [HttpPost]
        public async Task<ActionResult<Evento>> CrearEvento(Evento evento)
        {
            _context.Eventos.Add(evento);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetEvento), new { id = evento.Id }, evento);
        }

        // PUT: api/evento/5
        [HttpPut("{id}")]
        public async Task<IActionResult> EditarEvento(int id, Evento evento)
        {
            if (id != evento.Id) return BadRequest();
            _context.Entry(evento).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/evento/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarEvento(int id)
        {
            var evento = await _context.Eventos.FindAsync(id);
            if (evento == null) return NotFound();
            evento.Activo = false; // no se elimina, solo se desactiva
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
