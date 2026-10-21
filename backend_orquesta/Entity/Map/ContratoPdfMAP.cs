using Dapper.FluentMap.Mapping;

namespace Entity.Map
{
    public class ContratoPdfMAP : EntityMap<ContratoPdfBE>
    {
        public ContratoPdfMAP()
        {
            Map(m => m.Id).ToColumn("id");
            Map(m => m.CotizacionId).ToColumn("cotizacion_id");
            Map(m => m.RutaArchivo).ToColumn("ruta_archivo");
            Map(m => m.FechaGeneracion).ToColumn("fecha_generacion");
        }
    }
}
