using System.ComponentModel.DataAnnotations.Schema;

namespace backend_orquesta.Models
{
    [Table("MusicoAdicional")]
    public class MusicoAdicional
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; } = string.Empty;

        // 'normal' o 'viento'
        [Column("tipo")]
        public string Tipo { get; set; } = "normal";

        [Column("precio_adicional", TypeName = "decimal(10,2)")]
        public decimal PrecioAdicional { get; set; }

        [Column("activo")]
        public bool Activo { get; set; } = true;
    }
}
