using Dapper;
using Microsoft.Data.SqlClient;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace Data
{
    public class FinanzaDA
    {
        private readonly string cnBD = "";
        private string sqlQuery = "";

        public FinanzaDA(string cnBD)
        {
            this.cnBD = cnBD;
        }

        public List<Entity.FinanzaBE> listar()
        {
            sqlQuery = "usp_finanza_listar";

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                var lista = sqlCn.Query<Entity.FinanzaBE>(sqlQuery, commandType: CommandType.StoredProcedure).ToList();
                return lista;
            }
        }

        // anio/mes = null -> resumen total
        public Entity.ResumenFinanzaBE resumen(int? anio, int? mes)
        {
            sqlQuery = "usp_finanza_resumen";

            var p = new DynamicParameters();
            p.Add("anio", anio);
            p.Add("mes", mes);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.QueryFirstOrDefault<Entity.ResumenFinanzaBE>(sqlQuery, p, commandType: CommandType.StoredProcedure)
                       ?? new Entity.ResumenFinanzaBE();
            }
        }

        public int insertar(Entity.FinanzaBE entidad)
        {
            sqlQuery = "usp_finanza_insertar";

            var p = new DynamicParameters();
            p.Add("admin_id", entidad.AdminId);
            p.Add("cotizacion_id", entidad.CotizacionId);
            p.Add("tipo", entidad.Tipo);
            p.Add("monto", entidad.Monto);
            p.Add("descripcion", entidad.Descripcion);
            p.Add("categoria", entidad.Categoria);
            p.Add("fecha", entidad.Fecha.Date, DbType.Date);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }

        public int actualizar(Entity.FinanzaBE entidad)
        {
            sqlQuery = "usp_finanza_actualizar";

            var p = new DynamicParameters();
            p.Add("id", entidad.Id);
            p.Add("cotizacion_id", entidad.CotizacionId);
            p.Add("tipo", entidad.Tipo);
            p.Add("monto", entidad.Monto);
            p.Add("descripcion", entidad.Descripcion);
            p.Add("categoria", entidad.Categoria);
            p.Add("fecha", entidad.Fecha.Date, DbType.Date);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }

        public int eliminar(int id)
        {
            sqlQuery = "usp_finanza_eliminar";

            var p = new DynamicParameters();
            p.Add("id", id);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }
    }
}
