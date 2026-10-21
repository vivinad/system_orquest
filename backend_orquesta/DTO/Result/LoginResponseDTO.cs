namespace DTO.Result
{
    // Respuesta de api/auth/login (el frontend lee token, nombre y rol)
    public class LoginResponseDTO
    {
        public string Token { get; set; }
        public string Nombre { get; set; }
        public string Rol { get; set; }
    }
}
