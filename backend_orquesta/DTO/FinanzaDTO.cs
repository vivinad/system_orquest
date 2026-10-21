using System.ComponentModel.DataAnnotations;
using System;

namespace DTO
{
    public class FinanzaDTO
    {
        public int Id { get; set; }
        public int AdminId { get; set; }
        public string AdminNombre { get; set; }
        public int? CotizacionId { get; set; }
        [Required]
        public string Tipo { get; set; } = "ingreso"; // 'ingreso' o 'gasto'
        public decimal Monto { get; set; }
        [Required]
        public string Descripcion { get; set; } = string.Empty;
        public string Categoria { get; set; }
        public DateTime Fecha { get; set; } = DateTime.Today;
        public DateTime FechaRegistro { get; set; } = DateTime.Now;
    }

    // api/finanza/resumen
    public class ResumenFinanzaDTO
    {
        public decimal Ingresos { get; set; }
        public decimal Gastos { get; set; }
        public decimal Balance { get; set; }
    }

    // api/finanza/resumen/mes
    public class ResumenFinanzaMesDTO : ResumenFinanzaDTO
    {
        public int Anio { get; set; }
        public int Mes { get; set; }
    }
}
