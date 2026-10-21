using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace Data
{
    public class ContratoPdfDA
    {
        private readonly string cnBD = "";
        private string sqlQuery = "";

        public ContratoPdfDA(string cnBD)
        {
            this.cnBD = cnBD;
        }

        public Entity.ContratoPdfBE obtenerPorCotizacion(int cotizacionId)
        {
            sqlQuery = "usp_contrato_pdf_obtener";

            var p = new DynamicParameters();
            p.Add("cotizacion_id", cotizacionId);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.QueryFirstOrDefault<Entity.ContratoPdfBE>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }

        public int insertar(int cotizacionId, string rutaArchivo)
        {
            sqlQuery = "usp_contrato_pdf_insertar";

            var p = new DynamicParameters();
            p.Add("cotizacion_id", cotizacionId);
            p.Add("ruta_archivo", rutaArchivo);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }
    }
}
