using Dapper.FluentMap.Mapping;

namespace Entity.Map
{
    public class CotizacionMusicoMAP : EntityMap<CotizacionMusicoBE>
    {
        public CotizacionMusicoMAP()
        {
            Map(m => m.Id).ToColumn("id");
            Map(m => m.CotizacionId).ToColumn("cotizacion_id");
            Map(m => m.MusicoId).ToColumn("musico_id");
            Map(m => m.Cantidad).ToColumn("cantidad");
            Map(m => m.PrecioAplicado).ToColumn("precio_aplicado");
            Map(m => m.MusicoNombre).ToColumn("musico_nombre");
            Map(m => m.MusicoTipo).ToColumn("musico_tipo");
            Map(m => m.MusicoPrecioAdicional).ToColumn("musico_precio_adicional");
            Map(m => m.MusicoActivo).ToColumn("musico_activo");
        }
    }
}
