using System.ComponentModel.DataAnnotations.Schema;

namespace backend_orquesta.Models
{
    [Table("Finanza")]
    public class Finanza
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("admin_id")]
        public int AdminId { get; set; }

        [Column("cotizacion_id")]
        public int? CotizacionId { get; set; }

        // 'ingreso' o 'gasto'
        [Column("tipo")]
        public string Tipo { get; set; } = "ingreso";

        [Column("monto", TypeName = "decimal(10,2)")]
        public decimal Monto { get; set; }

        [Column("descripcion")]
        public string Descripcion { get; set; } = string.Empty;

        [Column("categoria")]
        public string? Categoria { get; set; }

        [Column("fecha")]
        public DateTime Fecha { get; set; } = DateTime.Today;

        [Column("fecha_registro")]
        public DateTime FechaRegistro { get; set; } = DateTime.Now;

        // Navegación
        [ForeignKey(nameof(AdminId))]
        public UsuarioAdmin? Admin { get; set; }

        [ForeignKey(nameof(CotizacionId))]
        public Cotizacion? Cotizacion { get; set; }
    }
}
