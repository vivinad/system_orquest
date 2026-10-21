using System;

namespace Entity
{
    public class ContratoPdfBE
    {
        public int Id { get; set; }
        public int CotizacionId { get; set; }
        public string RutaArchivo { get; set; }
        public DateTime FechaGeneracion { get; set; }
    }
}
