using System;

namespace Entity
{
    public class FinanzaBE
    {
        public int Id { get; set; }
        public int AdminId { get; set; }
        public string AdminNombre { get; set; } // viene del JOIN con UsuarioAdmin
        public int? CotizacionId { get; set; }
        public string Tipo { get; set; }
        public decimal Monto { get; set; }
        public string Descripcion { get; set; }
        public string Categoria { get; set; }
        public DateTime Fecha { get; set; }
        public DateTime FechaRegistro { get; set; }
    }

    public class ResumenFinanzaBE
    {
        public decimal Ingresos { get; set; }
        public decimal Gastos { get; set; }
    }
}
