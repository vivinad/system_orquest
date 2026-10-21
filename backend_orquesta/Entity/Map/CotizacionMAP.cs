using Dapper.FluentMap.Mapping;

namespace Entity.Map
{
    public class CotizacionMAP : EntityMap<CotizacionBE>
    {
        public CotizacionMAP()
        {
            Map(m => m.Id).ToColumn("id");
            Map(m => m.NombreCliente).ToColumn("nombre_cliente");
            Map(m => m.TelefonoCliente).ToColumn("telefono_cliente");
            Map(m => m.EmailCliente).ToColumn("email_cliente");
            Map(m => m.DniCliente).ToColumn("dni_cliente");
            Map(m => m.DireccionCliente).ToColumn("direccion_cliente");
            Map(m => m.PaqueteId).ToColumn("paquete_id");
            Map(m => m.DistritoId).ToColumn("distrito_id");
            Map(m => m.FechaEvento).ToColumn("fecha_evento");
            Map(m => m.DireccionEvento).ToColumn("direccion_evento");
            Map(m => m.HoraInicio).ToColumn("hora_inicio");
            Map(m => m.TipoEvento).ToColumn("tipo_evento");
            Map(m => m.DiaSemana).ToColumn("dia_semana");
            Map(m => m.HorasSolicitadas).ToColumn("horas_solicitadas");
            Map(m => m.CostoPaquete).ToColumn("costo_paquete");
            Map(m => m.CostoMusicosExtra).ToColumn("costo_musicos_extra");
            Map(m => m.CostoMovilidad).ToColumn("costo_movilidad");
            Map(m => m.Subtotal).ToColumn("subtotal");
            Map(m => m.Total).ToColumn("total");
            Map(m => m.Estado).ToColumn("estado");
            Map(m => m.TieneATratar).ToColumn("tiene_a_tratar");
            Map(m => m.MotivoATratar).ToColumn("motivo_a_tratar");
            Map(m => m.Observaciones).ToColumn("observaciones");
            Map(m => m.FechaCreacion).ToColumn("fecha_creacion");
            Map(m => m.CodigoAcceso).ToColumn("codigo_acceso");
        }
    }
}
