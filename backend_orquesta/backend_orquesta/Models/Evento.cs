using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_orquesta.Models
{
    [Table("Evento")]
    public class Evento
    {
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("titulo")]
        public string Titulo { get; set; } = string.Empty;

        // Texto libre para mostrar al público, ej: "11 y 12 de julio · desde la 1:00 PM"
        [Column("fecha_texto")]
        public string FechaTexto { get; set; } = string.Empty;

        // Último día del evento — sirve para saber si sigue vigente
        [Column("fecha")]
        public DateTime Fecha { get; set; }

        // Nombre del local, ej: Picantería "Huarique Piurano" — La Encantada
        [Column("lugar")]
        public string Lugar { get; set; } = string.Empty;

        // Dirección para el mapa de Google, ej: Av. José Saco Rojas, Carabayllo, Lima
        [Column("direccion")]
        public string Direccion { get; set; } = string.Empty;

        // URL o nombre de archivo del flyer, ej: evento1.png
        [Column("imagen_url")]
        public string ImagenUrl { get; set; } = string.Empty;

        [Column("activo")]
        public bool Activo { get; set; } = true;
    }
}
