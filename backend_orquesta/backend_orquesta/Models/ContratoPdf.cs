using System.ComponentModel.DataAnnotations.Schema;

namespace backend_orquesta.Models
{
    [Table("ContratoPdf")]
    public class ContratoPdf
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("cotizacion_id")]
        public int CotizacionId { get; set; }

        [Column("ruta_archivo")]
        public string RutaArchivo { get; set; } = string.Empty;

        [Column("fecha_generacion")]
        public DateTime FechaGeneracion { get; set; } = DateTime.Now;

        // Navegación
        [ForeignKey(nameof(CotizacionId))]
        public Cotizacion? Cotizacion { get; set; }
    }
}
