using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_orquesta.Data;
using backend_orquesta.Models;

namespace backend_orquesta.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CotizacionController : ControllerBase
    {
        private static readonly string[] DIAS =
            { "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado" };

        private readonly OrquestaDbContext _context;

        public CotizacionController(OrquestaDbContext context)
        {
            _context = context;
        }

        // POST: api/cotizacion/calcular — previsualizar el precio (no guarda nada)
        [HttpPost("calcular")]
        public async Task<ActionResult<CotizacionResultado>> Calcular(CotizacionRequest req)
        {
            var resultado = await CalcularInterno(req);
            if (resultado == null) return BadRequest(new { mensaje = "Paquete o distrito no válido." });
            return resultado;
        }

        // POST: api/cotizacion — crear la cotización (estado 'pendiente')
        [HttpPost]
        public async Task<ActionResult<Cotizacion>> Crear(CotizacionRequest req)
        {
            var r = await CalcularInterno(req);
            if (r == null) return BadRequest(new { mensaje = "Paquete o distrito no válido." });

            var cotizacion = new Cotizacion
            {
                NombreCliente = req.NombreCliente,
                TelefonoCliente = req.TelefonoCliente,
                EmailCliente = req.EmailCliente,
                PaqueteId = req.PaqueteId,
                DistritoId = req.DistritoId,
                FechaEvento = DateTime.Parse(req.FechaEvento),
                DiaSemana = r.DiaSemana,
                HorasSolicitadas = req.HorasSolicitadas,
                CostoPaquete = r.CostoPaquete,
                CostoMusicosExtra = r.CostoMusicosExtra,
                CostoMovilidad = r.CostoMovilidad,
                Subtotal = r.Subtotal,
                Total = r.Total,
                Estado = "pendiente",
                TieneATratar = r.TieneATratar,
                MotivoATratar = r.MotivoATratar,
                Observaciones = req.Observaciones,
                FechaCreacion = DateTime.Now,
                Musicos = r.MusicosDetalle.Select(m => new CotizacionMusico
                {
                    MusicoId = m.MusicoId,
                    Cantidad = m.Cantidad,
                    PrecioAplicado = m.PrecioAplicado,
                }).ToList(),
                Extras = req.ServiciosExtra.Select(id => new CotizacionExtra { ServicioId = id }).ToList(),
            };

            _context.Cotizaciones.Add(cotizacion);
            await _context.SaveChangesAsync();

            await _context.Entry(cotizacion).Reference(c => c.Paquete).LoadAsync();
            await _context.Entry(cotizacion).Reference(c => c.Distrito).LoadAsync();

            return CreatedAtAction(nameof(GetCotizacion), new { id = cotizacion.Id }, cotizacion);
        }

        // GET: api/cotizacion?estado=pendiente — listado para el admin
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cotizacion>>> GetCotizaciones([FromQuery] string? estado)
        {
            var query = _context.Cotizaciones
                .Include(c => c.Paquete)
                .Include(c => c.Distrito)
                .Include(c => c.Musicos).ThenInclude(m => m.Musico)
                .Include(c => c.Extras).ThenInclude(e => e.Servicio)
                .AsQueryable();

            if (!string.IsNullOrEmpty(estado))
                query = query.Where(c => c.Estado == estado);

            return await query.OrderByDescending(c => c.FechaCreacion).ToListAsync();
        }

        // GET: api/cotizacion/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Cotizacion>> GetCotizacion(int id)
        {
            var cotizacion = await _context.Cotizaciones
                .Include(c => c.Paquete)
                .Include(c => c.Distrito)
                .Include(c => c.Musicos).ThenInclude(m => m.Musico)
                .Include(c => c.Extras).ThenInclude(e => e.Servicio)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (cotizacion == null) return NotFound();
            return cotizacion;
        }

        // PUT: api/cotizacion/5/estado — el admin confirma/rechaza/marca pagada
        [HttpPut("{id}/estado")]
        public async Task<IActionResult> CambiarEstado(int id, CambioEstadoRequest req)
        {
            var cotizacion = await _context.Cotizaciones.FindAsync(id);
            if (cotizacion == null) return NotFound();

            cotizacion.Estado = req.Estado;
            if (req.Observaciones != null) cotizacion.Observaciones = req.Observaciones;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ---------- Cálculo (misma lógica que el frontend en modo demo) ----------
        private async Task<CotizacionResultado?> CalcularInterno(CotizacionRequest req)
        {
            var paquete = await _context.Paquetes.FindAsync(req.PaqueteId);
            var distrito = await _context.Distritos.FindAsync(req.DistritoId);
            if (paquete == null || distrito == null) return null;

            var fecha = DateTime.Parse(req.FechaEvento);
            var dow = (int)fecha.DayOfWeek;
            var finDeSemana = dow == 0 || dow == 6;
            var horas = req.HorasSolicitadas;
            var motivos = new List<string>();

            var horasBase = paquete.HorasBase > 0 ? paquete.HorasBase : 5;
            var precioPorHora = paquete.PrecioBase / horasBase;
            var costoPaquete = Math.Round(precioPorHora * horas, 2);

            if (finDeSemana && horas == 4)
                motivos.Add("Un evento de 4 horas en fin de semana se coordina directamente con la encargada.");

            decimal costoMusicos = 0;
            var detalle = new List<MusicoDetalle>();
            foreach (var sel in req.Musicos)
            {
                if (sel.Cantidad <= 0) continue;
                var m = await _context.MusicosAdicionales.FindAsync(sel.MusicoId);
                if (m == null) continue;
                costoMusicos += m.PrecioAdicional * sel.Cantidad;
                detalle.Add(new MusicoDetalle { MusicoId = m.Id, Cantidad = sel.Cantidad, PrecioAplicado = m.PrecioAdicional });
            }

            if (distrito.EsATratar)
                motivos.Add($"El distrito '{distrito.Nombre}' está fuera de Lima Metropolitana; la movilidad se coordina directamente.");

            foreach (var id in req.ServiciosExtra)
            {
                var s = await _context.ServiciosExtra.FindAsync(id);
                if (s != null && !s.TienePrecioFijo)
                    motivos.Add($"El servicio '{s.Nombre}' se coordina/cotiza directamente con el proveedor.");
            }

            var movilidad = distrito.CostoMovilidad;
            var subtotal = costoPaquete + costoMusicos + movilidad;

            return new CotizacionResultado
            {
                DiaSemana = DIAS[dow],
                CostoPaquete = costoPaquete,
                CostoMusicosExtra = costoMusicos,
                CostoMovilidad = movilidad,
                Subtotal = subtotal,
                Total = subtotal,
                TieneATratar = motivos.Count > 0,
                MotivoATratar = motivos.Count > 0 ? string.Join(" ", motivos) : null,
                MusicosDetalle = detalle,
            };
        }
    }

    // ---------- DTOs ----------
    public class CotizacionRequest
    {
        public string NombreCliente { get; set; } = string.Empty;
        public string TelefonoCliente { get; set; } = string.Empty;
        public string? EmailCliente { get; set; }
        public int PaqueteId { get; set; }
        public int DistritoId { get; set; }
        public string FechaEvento { get; set; } = string.Empty; // 'YYYY-MM-DD'
        public int HorasSolicitadas { get; set; }
        public List<MusicoSeleccion> Musicos { get; set; } = new();
        public List<int> ServiciosExtra { get; set; } = new();
        public string? Observaciones { get; set; }
    }

    public class MusicoSeleccion
    {
        public int MusicoId { get; set; }
        public int Cantidad { get; set; }
    }

    public class CotizacionResultado
    {
        public string DiaSemana { get; set; } = string.Empty;
        public decimal CostoPaquete { get; set; }
        public decimal CostoMusicosExtra { get; set; }
        public decimal CostoMovilidad { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Total { get; set; }
        public bool TieneATratar { get; set; }
        public string? MotivoATratar { get; set; }
        public List<MusicoDetalle> MusicosDetalle { get; set; } = new();
    }

    public class MusicoDetalle
    {
        public int MusicoId { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioAplicado { get; set; }
    }

    public class CambioEstadoRequest
    {
        public string Estado { get; set; } = string.Empty;
        public string? Observaciones { get; set; }
    }
}
