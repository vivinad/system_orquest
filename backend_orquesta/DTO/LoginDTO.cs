using System.ComponentModel.DataAnnotations;
namespace DTO
{
    public class LoginDTO
    {
        [Required]
        public string Email { get; set; } = string.Empty;
        [Required]
        public string Password { get; set; } = string.Empty;
    }

    // api/auth/restablecer-clave — solo en desarrollo y desde la misma PC.
    // Email vacío = el primer administrador activo.
    public class RestablecerClaveDTO
    {
        public string Email { get; set; }
        [Required]
        public string NuevaClave { get; set; } = string.Empty;
    }

    // api/auth/seed — crea el primer administrador
    public class SeedAdminDTO
    {
        [Required]
        public string Nombre { get; set; } = string.Empty;
        [Required]
        public string Email { get; set; } = string.Empty;
        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
