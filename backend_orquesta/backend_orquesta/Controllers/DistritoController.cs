using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_orquesta.Data;
using backend_orquesta.Models;

namespace backend_orquesta.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DistritoController : ControllerBase
    {
        private readonly OrquestaDbContext _context;

        public DistritoController(OrquestaDbContext context)
        {
            _context = context;
        }

        // GET: api/distrito
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Distrito>>> GetDistritos()
        {
            return await _context.Distritos
                .OrderBy(d => d.Nombre)
                .ToListAsync();
        }

        // GET: api/distrito/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Distrito>> GetDistrito(int id)
        {
            var distrito = await _context.Distritos.FindAsync(id);
            if (distrito == null) return NotFound();
            return distrito;
        }

        // PUT: api/distrito/5 — el admin puede ajustar el costo de movilidad
        [HttpPut("{id}")]
        public async Task<IActionResult> EditarDistrito(int id, Distrito distrito)
        {
            if (id != distrito.Id) return BadRequest();
            _context.Entry(distrito).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
