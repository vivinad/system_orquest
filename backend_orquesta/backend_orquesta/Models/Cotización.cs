using System.ComponentModel.DataAnnotations.Schema;

namespace backend_orquesta.Models
{
    [Table("Cotizacion")]
    public class Cotizacion
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("nombre_cliente")]
        public string NombreCliente { get; set; } = string.Empty;

        [Column("telefono_cliente")]
        public string TelefonoCliente { get; set; } = string.Empty;

        [Column("email_cliente")]
        public string? EmailCliente { get; set; }

        [Column("dni_cliente")]
        public string? DniCliente { get; set; }

        [Column("direccion_cliente")]
        public string? DireccionCliente { get; set; }

        [Column("paquete_id")]
        public int PaqueteId { get; set; }

        [Column("distrito_id")]
        public int DistritoId { get; set; }

        [Column("fecha_evento")]
        public DateTime FechaEvento { get; set; }

        [Column("dia_semana")]
        public string DiaSemana { get; set; } = string.Empty;

        [Column("horas_solicitadas")]
        public int HorasSolicitadas { get; set; }

        [Column("costo_paquete", TypeName = "decimal(10,2)")]
        public decimal CostoPaquete { get; set; }

        [Column("costo_musicos_extra", TypeName = "decimal(10,2)")]
        public decimal CostoMusicosExtra { get; set; }

        [Column("costo_movilidad", TypeName = "decimal(10,2)")]
        public decimal CostoMovilidad { get; set; }

        [Column("subtotal", TypeName = "decimal(10,2)")]
        public decimal Subtotal { get; set; }

        [Column("total", TypeName = "decimal(10,2)")]
        public decimal Total { get; set; }

        // 'pendiente', 'confirmada', 'pagada', 'rechazada'...
        [Column("estado")]
        public string Estado { get; set; } = "pendiente";

        [Column("tiene_a_tratar")]
        public bool TieneATratar { get; set; }

        [Column("motivo_a_tratar")]
        public string? MotivoATratar { get; set; }

        [Column("observaciones")]
        public string? Observaciones { get; set; }

        [Column("fecha_creacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        // Navegación
        [ForeignKey(nameof(PaqueteId))]
        public Paquete? Paquete { get; set; }

        [ForeignKey(nameof(DistritoId))]
        public Distrito? Distrito { get; set; }

        public List<CotizacionMusico> Musicos { get; set; } = new();
        public List<CotizacionExtra> Extras { get; set; } = new();
    }
}
