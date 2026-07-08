using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend_orquesta.Models
{
    [Table("CotizacionMusico")]
    public class CotizacionMusico
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("cotizacion_id")]
        public int CotizacionId { get; set; }

        [Column("musico_id")]
        public int MusicoId { get; set; }

        [Column("cantidad")]
        public int Cantidad { get; set; } = 1;

        [Column("precio_aplicado", TypeName = "decimal(10,2)")]
        public decimal PrecioAplicado { get; set; }

        // Navegación
        [JsonIgnore]
        [ForeignKey(nameof(CotizacionId))]
        public Cotizacion? Cotizacion { get; set; }

        [ForeignKey(nameof(MusicoId))]
        public MusicoAdicional? Musico { get; set; }
    }
}
