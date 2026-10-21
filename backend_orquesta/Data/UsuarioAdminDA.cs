using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace Data
{
    public class UsuarioAdminDA
    {
        private readonly string cnBD = "";
        private string sqlQuery = "";

        public UsuarioAdminDA(string cnBD)
        {
            this.cnBD = cnBD;
        }

        // Solo usuarios activos
        public Entity.UsuarioAdminBE obtenerPorEmail(string email)
        {
            sqlQuery = "usp_usuario_admin_obtener_por_email";

            var p = new DynamicParameters();
            p.Add("email", email);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.QueryFirstOrDefault<Entity.UsuarioAdminBE>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }

        // Cantidad de administradores registrados (activos o no)
        public int contar()
        {
            sqlQuery = "usp_usuario_admin_contar";

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int>(sqlQuery, commandType: CommandType.StoredProcedure);
            }
        }

        // Id del primer admin activo (0 si no hay ninguno)
        public int obtenerPrimerActivo()
        {
            sqlQuery = "usp_usuario_admin_primer_activo";

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int?>(sqlQuery, commandType: CommandType.StoredProcedure) ?? 0;
            }
        }

        // Cambia la clave (hash) del admin. email = null -> el primer admin activo.
        // Devuelve el correo del admin actualizado, o null si no existe.
        public string actualizarClave(string email, string passwordHash)
        {
            sqlQuery = "usp_usuario_admin_actualizar_clave";

            var p = new DynamicParameters();
            p.Add("email", string.IsNullOrWhiteSpace(email) ? null : email.Trim());
            p.Add("password_hash", passwordHash);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<string>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }

        public int insertar(Entity.UsuarioAdminBE entidad)
        {
            sqlQuery = "usp_usuario_admin_insertar";

            var p = new DynamicParameters();
            p.Add("nombre", entidad.Nombre);
            p.Add("email", entidad.Email);
            p.Add("password_hash", entidad.PasswordHash);
            p.Add("rol", entidad.Rol);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }
    }
}
