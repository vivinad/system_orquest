using System.ComponentModel.DataAnnotations.Schema;

namespace backend_orquesta.Models
{
    [Table("Paquete")]
    public class Paquete
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; } = string.Empty;

        // Qué incluye la agrupación (columna agregada en SETUP-BD.md)
        [Column("descripcion")]
        public string? Descripcion { get; set; }

        [Column("num_integrantes")]
        public int NumIntegrantes { get; set; }

        [Column("precio_base", TypeName = "decimal(10,2)")]
        public decimal PrecioBase { get; set; }

        [Column("horas_base")]
        public int HorasBase { get; set; } = 5;

        [Column("activo")]
        public bool Activo { get; set; } = true;
    }
}
