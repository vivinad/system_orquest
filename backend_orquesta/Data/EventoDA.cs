using Dapper;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace Data
{
    public class EventoDA
    {
        private readonly string cnBD = "";
        private string sqlQuery = "";

        public EventoDA(string cnBD)
        {
            this.cnBD = cnBD;
        }

        // Todos los activos (para el admin)
        public List<Entity.EventoBE> listar()
        {
            sqlQuery = "usp_evento_listar";

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                var lista = sqlCn.Query<Entity.EventoBE>(sqlQuery, commandType: CommandType.StoredProcedure).ToList();
                return lista;
            }
        }

        // Los quitados por el admin (para poder restaurarlos)
        public List<Entity.EventoBE> listarInactivos()
        {
            sqlQuery = "usp_evento_listar_inactivos";

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                var lista = sqlCn.Query<Entity.EventoBE>(sqlQuery, commandType: CommandType.StoredProcedure).ToList();
                return lista;
            }
        }

        // Solo los que aún no pasan (para la página pública)
        public List<Entity.EventoBE> listarVigentes(DateTime hoy)
        {
            sqlQuery = "usp_evento_listar_vigentes";

            var p = new DynamicParameters();
            p.Add("hoy", hoy.Date, DbType.Date);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                var lista = sqlCn.Query<Entity.EventoBE>(sqlQuery, p, commandType: CommandType.StoredProcedure).ToList();
                return lista;
            }
        }

        public Entity.EventoBE obtener(int id)
        {
            sqlQuery = "usp_evento_obtener";

            var p = new DynamicParameters();
            p.Add("id", id);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.QueryFirstOrDefault<Entity.EventoBE>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }

        public int insertar(Entity.EventoBE entidad)
        {
            sqlQuery = "usp_evento_insertar";

            var p = new DynamicParameters();
            p.Add("titulo", entidad.Titulo);
            p.Add("fecha_texto", entidad.FechaTexto);
            p.Add("fecha", entidad.Fecha.Date, DbType.Date);
            p.Add("lugar", entidad.Lugar);
            p.Add("direccion", entidad.Direccion);
            p.Add("imagen_url", entidad.ImagenUrl);
            p.Add("activo", entidad.Activo);
            p.Add("categoria", vacioANulo(entidad.Categoria));
            p.Add("horario", vacioANulo(entidad.Horario));
            p.Add("descripcion", vacioANulo(entidad.Descripcion));
            p.Add("servicios", vacioANulo(entidad.Servicios));

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }

        public int actualizar(Entity.EventoBE entidad)
        {
            sqlQuery = "usp_evento_actualizar";

            var p = new DynamicParameters();
            p.Add("id", entidad.Id);
            p.Add("titulo", entidad.Titulo);
            p.Add("fecha_texto", entidad.FechaTexto);
            p.Add("fecha", entidad.Fecha.Date, DbType.Date);
            p.Add("lugar", entidad.Lugar);
            p.Add("direccion", entidad.Direccion);
            p.Add("imagen_url", entidad.ImagenUrl);
            p.Add("activo", entidad.Activo);
            p.Add("categoria", vacioANulo(entidad.Categoria));
            p.Add("horario", vacioANulo(entidad.Horario));
            p.Add("descripcion", vacioANulo(entidad.Descripcion));
            p.Add("servicios", vacioANulo(entidad.Servicios));

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }

        private static string vacioANulo(string texto)
        {
            return string.IsNullOrWhiteSpace(texto) ? null : texto.Trim();
        }

        public int desactivar(int id)
        {
            sqlQuery = "usp_evento_desactivar";

            var p = new DynamicParameters();
            p.Add("id", id);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }
    }
}
