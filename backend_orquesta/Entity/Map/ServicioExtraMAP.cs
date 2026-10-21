using Dapper.FluentMap.Mapping;

namespace Entity.Map
{
    public class ServicioExtraMAP : EntityMap<ServicioExtraBE>
    {
        public ServicioExtraMAP()
        {
            Map(m => m.Id).ToColumn("id");
            Map(m => m.Nombre).ToColumn("nombre");
            Map(m => m.Descripcion).ToColumn("descripcion");
            Map(m => m.TelefonoContacto).ToColumn("telefono_contacto");
            Map(m => m.TienePrecioFijo).ToColumn("tiene_precio_fijo");
            Map(m => m.Precio).ToColumn("precio");
            Map(m => m.Activo).ToColumn("activo");
        }
    }
}
