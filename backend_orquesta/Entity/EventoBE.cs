using System;

namespace Entity
{
    public class EventoBE
    {
        public int Id { get; set; }
        public string Titulo { get; set; }
        public string FechaTexto { get; set; }
        public DateTime Fecha { get; set; }
        public string Lugar { get; set; }
        public string Direccion { get; set; }
        public string ImagenUrl { get; set; }
        public bool Activo { get; set; }

        // Datos opcionales para la cartelera de la página principal
        public string Categoria { get; set; }   // ej: Fiesta patronal, Festival playero
        public string Horario { get; set; }     // ej: 1:00 P.M. a 6:00 P.M.
        public string Descripcion { get; set; }
        public string Servicios { get; set; }   // separados por coma: Almuerzos, Estacionamiento...
    }
}
