using Dapper.FluentMap.Mapping;

namespace Entity.Map
{
    public class MediaHomeMAP : EntityMap<MediaHomeBE>
    {
        public MediaHomeMAP()
        {
            Map(m => m.Id).ToColumn("id");
            Map(m => m.Tipo).ToColumn("tipo");
            Map(m => m.Valor).ToColumn("valor");
            Map(m => m.Orden).ToColumn("orden");
        }
    }
}
