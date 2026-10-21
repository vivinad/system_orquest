using Dapper.FluentMap.Mapping;

namespace Entity.Map
{
    public class UsuarioAdminMAP : EntityMap<UsuarioAdminBE>
    {
        public UsuarioAdminMAP()
        {
            Map(m => m.Id).ToColumn("id");
            Map(m => m.Nombre).ToColumn("nombre");
            Map(m => m.Email).ToColumn("email");
            Map(m => m.PasswordHash).ToColumn("password_hash");
            Map(m => m.Rol).ToColumn("rol");
            Map(m => m.Activo).ToColumn("activo");
            Map(m => m.FechaCreacion).ToColumn("fecha_creacion");
        }
    }
}
