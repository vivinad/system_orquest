using Dapper;
using Microsoft.Data.SqlClient;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace Data
{
    public class PaqueteDA
    {
        private readonly string cnBD = "";
        private string sqlQuery = "";

        public PaqueteDA(string cnBD)
        {
            this.cnBD = cnBD;
        }

        public List<Entity.PaqueteBE> listar()
        {
            sqlQuery = "usp_paquete_listar";

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                var lista = sqlCn.Query<Entity.PaqueteBE>(sqlQuery, commandType: CommandType.StoredProcedure).ToList();
                return lista;
            }
        }

        public List<Entity.PaqueteBE> listarInactivos()
        {
            sqlQuery = "usp_paquete_listar_inactivos";

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                var lista = sqlCn.Query<Entity.PaqueteBE>(sqlQuery, commandType: CommandType.StoredProcedure).ToList();
                return lista;
            }
        }

        public Entity.PaqueteBE obtener(int id)
        {
            sqlQuery = "usp_paquete_obtener";

            var p = new DynamicParameters();
            p.Add("id", id);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.QueryFirstOrDefault<Entity.PaqueteBE>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }

        // Devuelve el id generado
        public int insertar(Entity.PaqueteBE entidad)
        {
            sqlQuery = "usp_paquete_insertar";

            var p = new DynamicParameters();
            p.Add("nombre", entidad.Nombre);
            p.Add("descripcion", entidad.Descripcion);
            p.Add("num_integrantes", entidad.NumIntegrantes);
            p.Add("precio_base", entidad.PrecioBase);
            p.Add("horas_base", entidad.HorasBase);
            p.Add("activo", entidad.Activo);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }

        // Devuelve las filas afectadas (0 = no existe)
        public int actualizar(Entity.PaqueteBE entidad)
        {
            sqlQuery = "usp_paquete_actualizar";

            var p = new DynamicParameters();
            p.Add("id", entidad.Id);
            p.Add("nombre", entidad.Nombre);
            p.Add("descripcion", entidad.Descripcion);
            p.Add("num_integrantes", entidad.NumIntegrantes);
            p.Add("precio_base", entidad.PrecioBase);
            p.Add("horas_base", entidad.HorasBase);
            p.Add("activo", entidad.Activo);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }

        // No se elimina, solo se desactiva
        public int desactivar(int id)
        {
            sqlQuery = "usp_paquete_desactivar";

            var p = new DynamicParameters();
            p.Add("id", id);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }
    }
}
