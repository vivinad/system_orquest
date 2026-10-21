using System.ComponentModel.DataAnnotations;
namespace DTO
{
    public class PaqueteDTO
    {
        public int Id { get; set; }
        [Required]
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; }
        public int NumIntegrantes { get; set; }
        public decimal PrecioBase { get; set; }
        public int HorasBase { get; set; } = 5;
        public bool Activo { get; set; } = true;
    }
}
