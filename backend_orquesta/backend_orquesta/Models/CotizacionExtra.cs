using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend_orquesta.Models
{
    [Table("CotizacionExtra")]
    public class CotizacionExtra
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("cotizacion_id")]
        public int CotizacionId { get; set; }

        [Column("servicio_id")]
        public int ServicioId { get; set; }

        // Navegación
        [JsonIgnore]
        [ForeignKey(nameof(CotizacionId))]
        public Cotizacion? Cotizacion { get; set; }

        [ForeignKey(nameof(ServicioId))]
        public ServicioExtra? Servicio { get; set; }
    }
}
