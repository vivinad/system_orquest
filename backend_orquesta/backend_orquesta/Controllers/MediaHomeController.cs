using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_orquesta.Data;
using backend_orquesta.Models;

namespace backend_orquesta.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MediaHomeController : ControllerBase
    {
        private static readonly string[] TIPOS_VALIDOS = { "video", "foto" };

        private readonly OrquestaDbContext _context;

        public MediaHomeController(OrquestaDbContext context)
        {
            _context = context;
        }

        // GET: api/mediahome?tipo=video — lista los medios del home (público)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MediaHome>>> GetMedia([FromQuery] string? tipo)
        {
            var query = _context.MediaHomes.AsQueryable();
            if (!string.IsNullOrEmpty(tipo))
                query = query.Where(m => m.Tipo == tipo);
            return await query.OrderBy(m => m.Orden).ThenBy(m => m.Id).ToListAsync();
        }

        // POST: api/mediahome — agrega un video o foto (admin)
        [HttpPost]
        public async Task<ActionResult<MediaHome>> Crear(MediaHome media)
        {
            if (!TIPOS_VALIDOS.Contains(media.Tipo))
                return BadRequest("Tipo no válido: debe ser 'video' o 'foto'.");
            if (string.IsNullOrWhiteSpace(media.Valor))
                return BadRequest("El valor es obligatorio.");

            var maxOrden = await _context.MediaHomes
                .Where(m => m.Tipo == media.Tipo)
                .Select(m => (int?)m.Orden)
                .MaxAsync() ?? 0;
            media.Orden = maxOrden + 1;

            _context.MediaHomes.Add(media);
            await _context.SaveChangesAsync();
            return Ok(media);
        }

        // DELETE: api/mediahome/5 — quita un video o foto del home (admin)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var media = await _context.MediaHomes.FindAsync(id);
            if (media == null) return NotFound();
            _context.MediaHomes.Remove(media);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
