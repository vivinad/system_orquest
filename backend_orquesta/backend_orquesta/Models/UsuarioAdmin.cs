using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend_orquesta.Models
{
    [Table("UsuarioAdmin")]
    public class UsuarioAdmin
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [JsonIgnore] // nunca exponer el hash en las respuestas del API
        [Column("password_hash")]
        public string PasswordHash { get; set; } = string.Empty;

        [Column("rol")]
        public string Rol { get; set; } = "admin";

        [Column("activo")]
        public bool Activo { get; set; } = true;

        [Column("fecha_creacion")]
        public DateTime FechaCreacion { get; set; } = DateTime.Now;
    }
}
