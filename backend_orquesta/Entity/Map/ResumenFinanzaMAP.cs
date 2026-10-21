using Dapper.FluentMap.Mapping;

namespace Entity.Map
{
    public class ResumenFinanzaMAP : EntityMap<ResumenFinanzaBE>
    {
        public ResumenFinanzaMAP()
        {
            Map(m => m.Ingresos).ToColumn("ingresos");
            Map(m => m.Gastos).ToColumn("gastos");
        }
    }
}
