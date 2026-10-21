namespace Service
{
    // Hash y verificación de contraseñas con BCrypt (la clave nunca se guarda en texto plano).
    public static class ClaveUsuarioHasher
    {
        public static string Hashear(string clave)
        {
            return BCrypt.Net.BCrypt.HashPassword(clave);
        }

        public static bool Verificar(string clave, string hash)
        {
            if (string.IsNullOrEmpty(clave) || string.IsNullOrEmpty(hash)) return false;
            try
            {
                return BCrypt.Net.BCrypt.Verify(clave, hash);
            }
            catch (BCrypt.Net.SaltParseException)
            {
                // Hash con formato inválido en la BD -> credenciales incorrectas
                return false;
            }
        }
    }
}
