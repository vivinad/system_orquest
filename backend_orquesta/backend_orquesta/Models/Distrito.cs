using System.ComponentModel.DataAnnotations.Schema;

namespace backend_orquesta.Models
{
    [Table("Distrito")]
    public class Distrito
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; } = string.Empty;

        // 'sin_costo', 'zona_50', 'zona_150', 'fuera_lima'
        [Column("zona")]
        public string Zona { get; set; } = "sin_costo";

        [Column("costo_movilidad", TypeName = "decimal(10,2)")]
        public decimal CostoMovilidad { get; set; }

        [Column("es_a_tratar")]
        public bool EsATratar { get; set; }
    }
}
