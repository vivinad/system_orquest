using Dapper;
using Microsoft.Data.SqlClient;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace Data
{
    public class DistritoDA
    {
        private readonly string cnBD = "";
        private string sqlQuery = "";

        public DistritoDA(string cnBD)
        {
            this.cnBD = cnBD;
        }

        public List<Entity.DistritoBE> listar()
        {
            sqlQuery = "usp_distrito_listar";

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                var lista = sqlCn.Query<Entity.DistritoBE>(sqlQuery, commandType: CommandType.StoredProcedure).ToList();
                return lista;
            }
        }

        public Entity.DistritoBE obtener(int id)
        {
            sqlQuery = "usp_distrito_obtener";

            var p = new DynamicParameters();
            p.Add("id", id);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.QueryFirstOrDefault<Entity.DistritoBE>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }

        public int actualizar(Entity.DistritoBE entidad)
        {
            sqlQuery = "usp_distrito_actualizar";

            var p = new DynamicParameters();
            p.Add("id", entidad.Id);
            p.Add("nombre", entidad.Nombre);
            p.Add("zona", entidad.Zona);
            p.Add("costo_movilidad", entidad.CostoMovilidad);
            p.Add("es_a_tratar", entidad.EsATratar);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }
    }
}
