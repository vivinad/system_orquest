using AutoMapper;

namespace Service
{
    public class UsuarioAdminSER
    {
        private Data.UsuarioAdminDA objData;
        private readonly string cnBD = "";
        private readonly IMapper mapper;

        public UsuarioAdminSER(string cnBD, IMapper mapper)
        {
            this.cnBD = cnBD;
            this.mapper = mapper;
        }

        // Mensaje genérico: no se indica si falló el correo o la clave
        public DTO.Result.Result<DTO.Result.LoginResponseDTO> login(DTO.LoginDTO dto, TokenSesionSER tokenSesion)
        {
            var result = new DTO.Result.Result<DTO.Result.LoginResponseDTO>();

            objData = new Data.UsuarioAdminDA(this.cnBD);
            Entity.UsuarioAdminBE usuario = objData.obtenerPorEmail(dto.Email);

            if (usuario == null || !ClaveUsuarioHasher.Verificar(dto.Password, usuario.PasswordHash))
            {
                result.errorCodigo = "CREDENCIALES";
                result.errorMensaje = "Credenciales incorrectas";
                return result;
            }

            result.value = new DTO.Result.LoginResponseDTO
            {
                Token = tokenSesion.generar(usuario.Id, usuario.Email, usuario.Rol),
                Nombre = usuario.Nombre,
                Rol = usuario.Rol
            };
            return result;
        }

        // Reemplaza la clave de un administrador (se usa solo en desarrollo, ver AuthController)
        public DTO.Result.Result<string> restablecerClave(DTO.RestablecerClaveDTO dto)
        {
            var result = new DTO.Result.Result<string>();

            if (string.IsNullOrWhiteSpace(dto.NuevaClave) || dto.NuevaClave.Length < 8)
            {
                result.errorCodigo = "VAL";
                result.errorMensaje = "La nueva clave debe tener al menos 8 caracteres.";
                return result;
            }

            objData = new Data.UsuarioAdminDA(this.cnBD);
            string email = objData.actualizarClave(dto.Email, ClaveUsuarioHasher.Hashear(dto.NuevaClave));
            if (email == null)
            {
                result.errorCodigo = "NOEXISTE";
                result.errorMensaje = "No existe un administrador con ese correo.";
                return result;
            }

            result.value = email;
            return result;
        }

        // Crea el primer administrador (solo si no existe ninguno)
        public DTO.Result.Result<int> crearPrimerAdmin(DTO.SeedAdminDTO dto)
        {
            var result = new DTO.Result.Result<int>();

            objData = new Data.UsuarioAdminDA(this.cnBD);
            if (objData.contar() > 0)
            {
                result.errorCodigo = "VAL";
                result.errorMensaje = "Ya existe un administrador.";
                return result;
            }

            var entidad = new Entity.UsuarioAdminBE
            {
                Nombre = dto.Nombre,
                Email = dto.Email,
                PasswordHash = ClaveUsuarioHasher.Hashear(dto.Password),
                Rol = global::Type.Usuario.Rol.Admin,
                Activo = true
            };

            result.value = objData.insertar(entidad);
            return result;
        }
    }
}
