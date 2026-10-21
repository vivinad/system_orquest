using Dapper;
using Microsoft.Data.SqlClient;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace Data
{
    public class MediaHomeDA
    {
        private readonly string cnBD = "";
        private string sqlQuery = "";

        public MediaHomeDA(string cnBD)
        {
            this.cnBD = cnBD;
        }

        // tipo = null -> todos
        public List<Entity.MediaHomeBE> listar(string tipo)
        {
            sqlQuery = "usp_media_home_listar";

            var p = new DynamicParameters();
            p.Add("tipo", string.IsNullOrEmpty(tipo) ? null : tipo);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                var lista = sqlCn.Query<Entity.MediaHomeBE>(sqlQuery, p, commandType: CommandType.StoredProcedure).ToList();
                return lista;
            }
        }

        // El procedimiento calcula el orden (último + 1) y devuelve la fila creada
        public Entity.MediaHomeBE insertar(Entity.MediaHomeBE entidad)
        {
            sqlQuery = "usp_media_home_insertar";

            var p = new DynamicParameters();
            p.Add("tipo", entidad.Tipo);
            p.Add("valor", entidad.Valor);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.QueryFirstOrDefault<Entity.MediaHomeBE>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }

        // Guarda el nuevo orden: el primer id queda en la posición 1, el segundo en la 2...
        public void cambiarOrden(List<int> ids)
        {
            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                sqlCn.Open();
                using (SqlTransaction tx = sqlCn.BeginTransaction())
                {
                    for (int i = 0; i < ids.Count; i++)
                    {
                        var p = new DynamicParameters();
                        p.Add("id", ids[i]);
                        p.Add("orden", i + 1);
                        sqlCn.Execute("usp_media_home_cambiar_orden", p, tx, commandType: CommandType.StoredProcedure);
                    }
                    tx.Commit();
                }
            }
        }

        public int eliminar(int id)
        {
            sqlQuery = "usp_media_home_eliminar";

            var p = new DynamicParameters();
            p.Add("id", id);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }
    }
}
