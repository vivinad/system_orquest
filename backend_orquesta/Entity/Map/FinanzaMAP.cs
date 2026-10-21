using Dapper.FluentMap.Mapping;

namespace Entity.Map
{
    public class FinanzaMAP : EntityMap<FinanzaBE>
    {
        public FinanzaMAP()
        {
            Map(m => m.Id).ToColumn("id");
            Map(m => m.AdminId).ToColumn("admin_id");
            Map(m => m.AdminNombre).ToColumn("admin_nombre");
            Map(m => m.CotizacionId).ToColumn("cotizacion_id");
            Map(m => m.Tipo).ToColumn("tipo");
            Map(m => m.Monto).ToColumn("monto");
            Map(m => m.Descripcion).ToColumn("descripcion");
            Map(m => m.Categoria).ToColumn("categoria");
            Map(m => m.Fecha).ToColumn("fecha");
            Map(m => m.FechaRegistro).ToColumn("fecha_registro");
        }
    }
}
