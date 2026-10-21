using Dapper.FluentMap.Mapping;

namespace Entity.Map
{
    public class EventoMAP : EntityMap<EventoBE>
    {
        public EventoMAP()
        {
            Map(m => m.Id).ToColumn("id");
            Map(m => m.Titulo).ToColumn("titulo");
            Map(m => m.FechaTexto).ToColumn("fecha_texto");
            Map(m => m.Fecha).ToColumn("fecha");
            Map(m => m.Lugar).ToColumn("lugar");
            Map(m => m.Direccion).ToColumn("direccion");
            Map(m => m.ImagenUrl).ToColumn("imagen_url");
            Map(m => m.Activo).ToColumn("activo");
            Map(m => m.Categoria).ToColumn("categoria");
            Map(m => m.Horario).ToColumn("horario");
            Map(m => m.Descripcion).ToColumn("descripcion");
            Map(m => m.Servicios).ToColumn("servicios");
        }
    }
}
