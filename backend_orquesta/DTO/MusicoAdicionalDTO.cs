using System.ComponentModel.DataAnnotations;
namespace DTO
{
    public class MusicoAdicionalDTO
    {
        public int Id { get; set; }
        [Required]
        public string Nombre { get; set; } = string.Empty;
        [Required]
        public string Tipo { get; set; } = "normal"; // 'normal' o 'viento'
        public decimal PrecioAdicional { get; set; }
        public bool Activo { get; set; } = true;
    }
}
