using System;
using System.ComponentModel.DataAnnotations;

namespace DTO
{
    public class EventoDTO
    {
        public int Id { get; set; }

        [Required]
        public string Titulo { get; set; } = string.Empty;

        // Texto libre para el público, ej: "11 y 12 de julio · desde la 1:00 PM"
        [Required]
        public string FechaTexto { get; set; } = string.Empty;

        // Último día del evento — sirve para saber si sigue vigente
        public DateTime Fecha { get; set; }

        [Required]
        public string Lugar { get; set; } = string.Empty;

        // Dirección para el mapa de Google
        [Required]
        public string Direccion { get; set; } = string.Empty;

        // URL o nombre de archivo del flyer (o imagen base64)
        [Required]
        public string ImagenUrl { get; set; } = string.Empty;

        public bool Activo { get; set; } = true;

        // Opcionales (cartelera de la página principal)
        public string Categoria { get; set; }
        public string Horario { get; set; }
        public string Descripcion { get; set; }
        public string Servicios { get; set; }
    }
}
