using System.ComponentModel.DataAnnotations;
namespace DTO
{
    public class ServicioExtraDTO
    {
        public int Id { get; set; }
        [Required]
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; }
        public string TelefonoContacto { get; set; }
        public bool TienePrecioFijo { get; set; }
        public decimal? Precio { get; set; }
        public bool Activo { get; set; } = true;
    }
}
