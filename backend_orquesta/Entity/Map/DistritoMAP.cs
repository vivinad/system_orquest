using Dapper.FluentMap.Mapping;

namespace Entity.Map
{
    public class DistritoMAP : EntityMap<DistritoBE>
    {
        public DistritoMAP()
        {
            Map(m => m.Id).ToColumn("id");
            Map(m => m.Nombre).ToColumn("nombre");
            Map(m => m.Zona).ToColumn("zona");
            Map(m => m.CostoMovilidad).ToColumn("costo_movilidad");
            Map(m => m.EsATratar).ToColumn("es_a_tratar");
        }
    }
}
