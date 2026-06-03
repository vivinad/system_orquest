using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_orquesta.Data;
using backend_orquesta.Models;

namespace backend_orquesta.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FinanzaController : ControllerBase
    {
        private readonly OrquestaDbContext _context;

        public FinanzaController(OrquestaDbContext context)
        {
            _context = context;
        }

        // GET: api/finanza
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Finanza>>> GetFinanzas()
        {
            return await _context.Finanzas
                .Include(f => f.Admin)
                .Include(f => f.Cotizacion)
                .OrderByDescending(f => f.Fecha)
                .ToListAsync();
        }

        // GET: api/finanza/resumen
        [HttpGet("resumen")]
        public async Task<IActionResult> GetResumen()
        {
            var ingresos = await _context.Finanzas
                .Where(f => f.Tipo == "ingreso")
                .SumAsync(f => f.Monto);

            var gastos = await _context.Finanzas
                .Where(f => f.Tipo == "gasto")
                .SumAsync(f => f.Monto);

            return Ok(new
            {
                ingresos,
                gastos,
                balance = ingresos - gastos
            });
        }

        // GET: api/finanza/resumen/mes?anio=2025&mes=6
        [HttpGet("resumen/mes")]
        public async Task<IActionResult> GetResumenMes(int anio, int mes)
        {
            var ingresos = await _context.Finanzas
                .Where(f => f.Tipo == "ingreso" && f.Fecha.Year == anio && f.Fecha.Month == mes)
                .SumAsync(f => f.Monto);

            var gastos = await _context.Finanzas
                .Where(f => f.Tipo == "gasto" && f.Fecha.Year == anio && f.Fecha.Month == mes)
                .SumAsync(f => f.Monto);

            return Ok(new
            {
                anio,
                mes,
                ingresos,
                gastos,
                balance = ingresos - gastos
            });
        }

        // POST: api/finanza
        [HttpPost]
        public async Task<ActionResult<Finanza>> CrearFinanza(Finanza finanza)
        {
            _context.Finanzas.Add(finanza);
            await _context.SaveChangesAsync();
            return Ok(finanza);
        }

        // PUT: api/finanza/5
        [HttpPut("{id}")]
        public async Task<IActionResult> EditarFinanza(int id, Finanza finanza)
        {
            if (id != finanza.Id) return BadRequest();
            _context.Entry(finanza).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/finanza/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarFinanza(int id)
        {
            var finanza = await _context.Finanzas.FindAsync(id);
            if (finanza == null) return NotFound();
            _context.Finanzas.Remove(finanza);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}