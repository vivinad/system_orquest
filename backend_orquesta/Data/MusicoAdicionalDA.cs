using Dapper;
using Microsoft.Data.SqlClient;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace Data
{
    public class MusicoAdicionalDA
    {
        private readonly string cnBD = "";
        private string sqlQuery = "";

        public MusicoAdicionalDA(string cnBD)
        {
            this.cnBD = cnBD;
        }

        public List<Entity.MusicoAdicionalBE> listar()
        {
            sqlQuery = "usp_musico_adicional_listar";

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                var lista = sqlCn.Query<Entity.MusicoAdicionalBE>(sqlQuery, commandType: CommandType.StoredProcedure).ToList();
                return lista;
            }
        }

        public Entity.MusicoAdicionalBE obtener(int id)
        {
            sqlQuery = "usp_musico_adicional_obtener";

            var p = new DynamicParameters();
            p.Add("id", id);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.QueryFirstOrDefault<Entity.MusicoAdicionalBE>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }

        public int insertar(Entity.MusicoAdicionalBE entidad)
        {
            sqlQuery = "usp_musico_adicional_insertar";

            var p = new DynamicParameters();
            p.Add("nombre", entidad.Nombre);
            p.Add("tipo", entidad.Tipo);
            p.Add("precio_adicional", entidad.PrecioAdicional);
            p.Add("activo", entidad.Activo);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }

        public int actualizar(Entity.MusicoAdicionalBE entidad)
        {
            sqlQuery = "usp_musico_adicional_actualizar";

            var p = new DynamicParameters();
            p.Add("id", entidad.Id);
            p.Add("nombre", entidad.Nombre);
            p.Add("tipo", entidad.Tipo);
            p.Add("precio_adicional", entidad.PrecioAdicional);
            p.Add("activo", entidad.Activo);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }

        public int desactivar(int id)
        {
            sqlQuery = "usp_musico_adicional_desactivar";

            var p = new DynamicParameters();
            p.Add("id", id);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }
    }
}
