using Dapper.FluentMap.Mapping;

namespace Entity.Map
{
    public class PaqueteMAP : EntityMap<PaqueteBE>
    {
        public PaqueteMAP()
        {
            Map(m => m.Id).ToColumn("id");
            Map(m => m.Nombre).ToColumn("nombre");
            Map(m => m.Descripcion).ToColumn("descripcion");
            Map(m => m.NumIntegrantes).ToColumn("num_integrantes");
            Map(m => m.PrecioBase).ToColumn("precio_base");
            Map(m => m.HorasBase).ToColumn("horas_base");
            Map(m => m.Activo).ToColumn("activo");
        }
    }
}
