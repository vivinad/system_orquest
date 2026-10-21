using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Service
{
    // Genera el JWT del panel administrativo. Los valores salen de appsettings.json (sección "Jwt").
    public class TokenSesionSER
    {
        private readonly string key;
        private readonly string issuer;
        private readonly string audience;
        private readonly int horasVigencia;

        public TokenSesionSER(string key, string issuer, string audience, int horasVigencia = 8)
        {
            this.key = key;
            this.issuer = issuer;
            this.audience = audience;
            this.horasVigencia = horasVigencia;
        }

        public string generar(int idUsuario, string email, string rol)
        {
            var llave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(this.key));
            var credenciales = new SigningCredentials(llave, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, idUsuario.ToString()),
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Role, rol)
            };

            var token = new JwtSecurityToken(
                issuer: this.issuer,
                audience: this.audience,
                claims: claims,
                expires: DateTime.Now.AddHours(this.horasVigencia),
                signingCredentials: credenciales
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
