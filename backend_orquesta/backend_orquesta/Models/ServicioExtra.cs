using System.ComponentModel.DataAnnotations.Schema;

namespace backend_orquesta.Models
{
    [Table("ServicioExtra")]
    public class ServicioExtra
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [Column("descripcion")]
        public string? Descripcion { get; set; }

        [Column("telefono_contacto")]
        public string? TelefonoContacto { get; set; }

        [Column("tiene_precio_fijo")]
        public bool TienePrecioFijo { get; set; }

        [Column("precio", TypeName = "decimal(10,2)")]
        public decimal? Precio { get; set; }

        [Column("activo")]
        public bool Activo { get; set; } = true;
    }
}
