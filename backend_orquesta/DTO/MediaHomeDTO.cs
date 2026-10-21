using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
namespace DTO
{
    // Video de YouTube o foto de portada del home
    public class MediaHomeDTO
    {
        public int Id { get; set; }
        [Required]
        public string Tipo { get; set; } = "video"; // 'video' o 'foto'
        [Required]
        public string Valor { get; set; } = string.Empty;
        public int Orden { get; set; }
    }

    // Nuevo orden de los videos o fotos: ids en el orden en que deben mostrarse
    public class MediaOrdenDTO
    {
        [Required]
        public List<int> Ids { get; set; } = new List<int>();
    }
}
