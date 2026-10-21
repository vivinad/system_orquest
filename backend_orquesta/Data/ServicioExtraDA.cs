using Dapper;
using Microsoft.Data.SqlClient;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace Data
{
    public class ServicioExtraDA
    {
        private readonly string cnBD = "";
        private string sqlQuery = "";

        public ServicioExtraDA(string cnBD)
        {
            this.cnBD = cnBD;
        }

        public List<Entity.ServicioExtraBE> listar()
        {
            sqlQuery = "usp_servicio_extra_listar";

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                var lista = sqlCn.Query<Entity.ServicioExtraBE>(sqlQuery, commandType: CommandType.StoredProcedure).ToList();
                return lista;
            }
        }

        public Entity.ServicioExtraBE obtener(int id)
        {
            sqlQuery = "usp_servicio_extra_obtener";

            var p = new DynamicParameters();
            p.Add("id", id);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.QueryFirstOrDefault<Entity.ServicioExtraBE>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }

        public int insertar(Entity.ServicioExtraBE entidad)
        {
            sqlQuery = "usp_servicio_extra_insertar";

            var p = new DynamicParameters();
            p.Add("nombre", entidad.Nombre);
            p.Add("descripcion", entidad.Descripcion);
            p.Add("telefono_contacto", entidad.TelefonoContacto);
            p.Add("tiene_precio_fijo", entidad.TienePrecioFijo);
            p.Add("precio", entidad.Precio);
            p.Add("activo", entidad.Activo);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }

        public int actualizar(Entity.ServicioExtraBE entidad)
        {
            sqlQuery = "usp_servicio_extra_actualizar";

            var p = new DynamicParameters();
            p.Add("id", entidad.Id);
            p.Add("nombre", entidad.Nombre);
            p.Add("descripcion", entidad.Descripcion);
            p.Add("telefono_contacto", entidad.TelefonoContacto);
            p.Add("tiene_precio_fijo", entidad.TienePrecioFijo);
            p.Add("precio", entidad.Precio);
            p.Add("activo", entidad.Activo);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }

        public int desactivar(int id)
        {
            sqlQuery = "usp_servicio_extra_desactivar";

            var p = new DynamicParameters();
            p.Add("id", id);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }
    }
}
