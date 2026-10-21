using Dapper.FluentMap.Mapping;

namespace Entity.Map
{
    public class MusicoAdicionalMAP : EntityMap<MusicoAdicionalBE>
    {
        public MusicoAdicionalMAP()
        {
            Map(m => m.Id).ToColumn("id");
            Map(m => m.Nombre).ToColumn("nombre");
            Map(m => m.Tipo).ToColumn("tipo");
            Map(m => m.PrecioAdicional).ToColumn("precio_adicional");
            Map(m => m.Activo).ToColumn("activo");
        }
    }
}
