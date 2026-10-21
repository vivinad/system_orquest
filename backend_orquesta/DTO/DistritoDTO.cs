using System.ComponentModel.DataAnnotations;
namespace DTO
{
    public class DistritoDTO
    {
        public int Id { get; set; }
        [Required]
        public string Nombre { get; set; } = string.Empty;
        [Required]
        public string Zona { get; set; } = "sin_costo"; // 'sin_costo', 'zona_50', 'zona_150', 'fuera_lima'
        public decimal CostoMovilidad { get; set; }
        public bool EsATratar { get; set; }
    }
}
