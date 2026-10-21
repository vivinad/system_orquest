using Dapper;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace Data
{
    public class CotizacionDA
    {
        private readonly string cnBD = "";
        private string sqlQuery = "";

        public CotizacionDA(string cnBD)
        {
            this.cnBD = cnBD;
        }

        // ¿Hay una cotización con alguno de esos estados en esa fecha?
        public bool fechaOcupada(DateTime fecha, string[] estados)
        {
            sqlQuery = "usp_cotizacion_fecha_ocupada";

            var p = new DynamicParameters();
            p.Add("fecha", fecha.Date, DbType.Date);
            p.Add("estados", string.Join(",", estados));

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<bool>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }

        // Guarda la cotización con sus músicos y servicios extra en una sola transacción.
        // Devuelve el id generado.
        public int insertar(Entity.CotizacionBE entidad, List<Entity.CotizacionMusicoBE> musicos, List<int> serviciosExtra)
        {
            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                sqlCn.Open();
                using (SqlTransaction tx = sqlCn.BeginTransaction())
                {
                    sqlQuery = "usp_cotizacion_insertar";

                    var p = new DynamicParameters();
                    p.Add("nombre_cliente", entidad.NombreCliente);
                    p.Add("telefono_cliente", entidad.TelefonoCliente);
                    p.Add("email_cliente", entidad.EmailCliente);
                    p.Add("dni_cliente", entidad.DniCliente);
                    p.Add("direccion_cliente", entidad.DireccionCliente);
                    p.Add("paquete_id", entidad.PaqueteId);
                    p.Add("distrito_id", entidad.DistritoId);
                    p.Add("fecha_evento", entidad.FechaEvento.Date, DbType.Date);
                    p.Add("direccion_evento", entidad.DireccionEvento);
                    p.Add("hora_inicio", entidad.HoraInicio);
                    p.Add("tipo_evento", entidad.TipoEvento);
                    p.Add("dia_semana", entidad.DiaSemana);
                    p.Add("horas_solicitadas", entidad.HorasSolicitadas);
                    p.Add("costo_paquete", entidad.CostoPaquete);
                    p.Add("costo_musicos_extra", entidad.CostoMusicosExtra);
                    p.Add("costo_movilidad", entidad.CostoMovilidad);
                    p.Add("subtotal", entidad.Subtotal);
                    p.Add("total", entidad.Total);
                    p.Add("estado", entidad.Estado);
                    p.Add("tiene_a_tratar", entidad.TieneATratar);
                    p.Add("motivo_a_tratar", entidad.MotivoATratar);
                    p.Add("observaciones", entidad.Observaciones);

                    int idCotizacion = sqlCn.ExecuteScalar<int>(sqlQuery, p, tx, commandType: CommandType.StoredProcedure);

                    foreach (var m in musicos)
                    {
                        var pm = new DynamicParameters();
                        pm.Add("cotizacion_id", idCotizacion);
                        pm.Add("musico_id", m.MusicoId);
                        pm.Add("cantidad", m.Cantidad);
                        pm.Add("precio_aplicado", m.PrecioAplicado);
                        sqlCn.Execute("usp_cotizacion_musico_insertar", pm, tx, commandType: CommandType.StoredProcedure);
                    }

                    foreach (var idServicio in serviciosExtra)
                    {
                        var pe = new DynamicParameters();
                        pe.Add("cotizacion_id", idCotizacion);
                        pe.Add("servicio_id", idServicio);
                        sqlCn.Execute("usp_cotizacion_extra_insertar", pe, tx, commandType: CommandType.StoredProcedure);
                    }

                    tx.Commit();
                    return idCotizacion;
                }
            }
        }

        // id = null y estado = null -> todas. Devuelve 5 result sets:
        // cotizaciones, paquetes, distritos, músicos y servicios extra de esas cotizaciones.
        public Entity.CotizacionListadoBE listar(int? id, string estado)
        {
            sqlQuery = "usp_cotizacion_listar";

            var p = new DynamicParameters();
            p.Add("id", id);
            p.Add("estado", string.IsNullOrEmpty(estado) ? null : estado);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            using (var multi = sqlCn.QueryMultiple(sqlQuery, p, commandType: CommandType.StoredProcedure))
            {
                var resultado = new Entity.CotizacionListadoBE();
                resultado.Cotizaciones = multi.Read<Entity.CotizacionBE>().ToList();
                resultado.Paquetes = multi.Read<Entity.PaqueteBE>().ToList();
                resultado.Distritos = multi.Read<Entity.DistritoBE>().ToList();
                resultado.Musicos = multi.Read<Entity.CotizacionMusicoBE>().ToList();
                resultado.Extras = multi.Read<Entity.CotizacionExtraBE>().ToList();
                return resultado;
            }
        }

        // Actualiza los datos de la cotización y reemplaza sus músicos y servicios extra (una transacción).
        // Devuelve las filas afectadas (0 = no existe).
        public int actualizar(Entity.CotizacionBE entidad, List<Entity.CotizacionMusicoBE> musicos, List<int> serviciosExtra)
        {
            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                sqlCn.Open();
                using (SqlTransaction tx = sqlCn.BeginTransaction())
                {
                    var p = new DynamicParameters();
                    p.Add("id", entidad.Id);
                    p.Add("nombre_cliente", entidad.NombreCliente);
                    p.Add("telefono_cliente", entidad.TelefonoCliente);
                    p.Add("email_cliente", entidad.EmailCliente);
                    p.Add("dni_cliente", entidad.DniCliente);
                    p.Add("direccion_cliente", entidad.DireccionCliente);
                    p.Add("paquete_id", entidad.PaqueteId);
                    p.Add("distrito_id", entidad.DistritoId);
                    p.Add("fecha_evento", entidad.FechaEvento.Date, DbType.Date);
                    p.Add("direccion_evento", entidad.DireccionEvento);
                    p.Add("hora_inicio", entidad.HoraInicio);
                    p.Add("tipo_evento", entidad.TipoEvento);
                    p.Add("dia_semana", entidad.DiaSemana);
                    p.Add("horas_solicitadas", entidad.HorasSolicitadas);
                    p.Add("costo_paquete", entidad.CostoPaquete);
                    p.Add("costo_musicos_extra", entidad.CostoMusicosExtra);
                    p.Add("costo_movilidad", entidad.CostoMovilidad);
                    p.Add("subtotal", entidad.Subtotal);
                    p.Add("total", entidad.Total);
                    p.Add("tiene_a_tratar", entidad.TieneATratar);
                    p.Add("motivo_a_tratar", entidad.MotivoATratar);
                    p.Add("observaciones", entidad.Observaciones);

                    int filas = sqlCn.ExecuteScalar<int>("usp_cotizacion_actualizar", p, tx, commandType: CommandType.StoredProcedure);
                    if (filas < 1)
                    {
                        tx.Rollback();
                        return 0;
                    }

                    var pl = new DynamicParameters();
                    pl.Add("cotizacion_id", entidad.Id);
                    sqlCn.Execute("usp_cotizacion_detalle_limpiar", pl, tx, commandType: CommandType.StoredProcedure);

                    foreach (var m in musicos)
                    {
                        var pm = new DynamicParameters();
                        pm.Add("cotizacion_id", entidad.Id);
                        pm.Add("musico_id", m.MusicoId);
                        pm.Add("cantidad", m.Cantidad);
                        pm.Add("precio_aplicado", m.PrecioAplicado);
                        sqlCn.Execute("usp_cotizacion_musico_insertar", pm, tx, commandType: CommandType.StoredProcedure);
                    }

                    foreach (var idServicio in serviciosExtra)
                    {
                        var pe = new DynamicParameters();
                        pe.Add("cotizacion_id", entidad.Id);
                        pe.Add("servicio_id", idServicio);
                        sqlCn.Execute("usp_cotizacion_extra_insertar", pe, tx, commandType: CommandType.StoredProcedure);
                    }

                    tx.Commit();
                    return filas;
                }
            }
        }

        // Confirmadas/pagadas cuya fecha ya pasó -> 'realizada'. Devuelve cuántas cambió.
        public int marcarRealizadas(DateTime hoy)
        {
            sqlQuery = "usp_cotizacion_marcar_realizadas";

            var p = new DynamicParameters();
            p.Add("hoy", hoy.Date, DbType.Date);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }

        public int cambiarEstado(int id, string estado, string observaciones)
        {
            sqlQuery = "usp_cotizacion_cambiar_estado";

            var p = new DynamicParameters();
            p.Add("id", id);
            p.Add("estado", estado);
            p.Add("observaciones", observaciones);

            using (SqlConnection sqlCn = new SqlConnection(this.cnBD))
            {
                return sqlCn.ExecuteScalar<int>(sqlQuery, p, commandType: CommandType.StoredProcedure);
            }
        }
    }
}
