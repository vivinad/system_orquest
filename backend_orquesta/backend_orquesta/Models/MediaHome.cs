using System.ComponentModel.DataAnnotations.Schema;

namespace backend_orquesta.Models
{
    // Videos de YouTube y fotos de portada que se muestran en la página principal
    [Table("MediaHome")]
    public class MediaHome
    {
        [Column("id")]
        public int Id { get; set; }

        // 'video' (ID de YouTube) o 'foto' (imagen)
        [Column("tipo")]
        public string Tipo { get; set; } = "video";

        // ID del video o la imagen (nombre de archivo o base64)
        [Column("valor")]
        public string Valor { get; set; } = string.Empty;

        [Column("orden")]
        public int Orden { get; set; }
    }
}
