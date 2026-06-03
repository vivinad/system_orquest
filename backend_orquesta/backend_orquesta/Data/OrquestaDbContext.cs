using Microsoft.EntityFrameworkCore;
using backend_orquesta.Models;

namespace backend_orquesta.Data
{
    public class OrquestaDbContext : DbContext
    {
        public OrquestaDbContext(DbContextOptions<OrquestaDbContext> options)
            : base(options)
        {
        }

        public DbSet<Paquete> Paquetes { get; set; }
        public DbSet<MusicoAdicional> MusicosAdicionales { get; set; }
        public DbSet<Distrito> Distritos { get; set; }
        public DbSet<ServicioExtra> ServiciosExtra { get; set; }
        public DbSet<UsuarioAdmin> UsuariosAdmin { get; set; }
        public DbSet<Cotizacion> Cotizaciones { get; set; }
        public DbSet<CotizacionMusico> CotizacionMusicos { get; set; }
        public DbSet<CotizacionExtra> CotizacionExtras { get; set; }
        public DbSet<ContratoPdf> ContratosPdf { get; set; }
        public DbSet<Finanza> Finanzas { get; set; }
    }
}