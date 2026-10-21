using Dapper.FluentMap.Mapping;

namespace Entity.Map
{
    public class CotizacionExtraMAP : EntityMap<CotizacionExtraBE>
    {
        public CotizacionExtraMAP()
        {
            Map(m => m.Id).ToColumn("id");
            Map(m => m.CotizacionId).ToColumn("cotizacion_id");
            Map(m => m.ServicioId).ToColumn("servicio_id");
            Map(m => m.ServicioNombre).ToColumn("servicio_nombre");
            Map(m => m.ServicioDescripcion).ToColumn("servicio_descripcion");
            Map(m => m.ServicioTelefonoContacto).ToColumn("servicio_telefono_contacto");
            Map(m => m.ServicioTienePrecioFijo).ToColumn("servicio_tiene_precio_fijo");
            Map(m => m.ServicioPrecio).ToColumn("servicio_precio");
            Map(m => m.ServicioActivo).ToColumn("servicio_activo");
        }
    }
}
