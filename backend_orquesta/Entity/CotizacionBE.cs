using System;
using System.Collections.Generic;

namespace Entity
{
    public class CotizacionBE
    {
        public int Id { get; set; }
        public string NombreCliente { get; set; }
        public string TelefonoCliente { get; set; }
        public string EmailCliente { get; set; }
        public string DniCliente { get; set; }
        public string DireccionCliente { get; set; }
        public int PaqueteId { get; set; }
        public int DistritoId { get; set; }
        public DateTime FechaEvento { get; set; }
        public string DireccionEvento { get; set; }
        public string HoraInicio { get; set; }
        public string TipoEvento { get; set; }
        public string DiaSemana { get; set; }
        public int HorasSolicitadas { get; set; }
        public decimal CostoPaquete { get; set; }
        public decimal CostoMusicosExtra { get; set; }
        public decimal CostoMovilidad { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Total { get; set; }
        public string Estado { get; set; }
        public bool TieneATratar { get; set; }
        public string MotivoATratar { get; set; }
        public string Observaciones { get; set; }
        public DateTime FechaCreacion { get; set; }
        public Guid? CodigoAcceso { get; set; } // clave para que el cliente descargue su contrato
    }

    // Músico agregado a una cotización + datos del músico (JOIN con MusicoAdicional)
    public class CotizacionMusicoBE
    {
        public int Id { get; set; }
        public int CotizacionId { get; set; }
        public int MusicoId { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioAplicado { get; set; }

        public string MusicoNombre { get; set; }
        public string MusicoTipo { get; set; }
        public decimal MusicoPrecioAdicional { get; set; }
        public bool MusicoActivo { get; set; }
    }

    // Servicio extra agregado a una cotización + datos del servicio (JOIN con ServicioExtra)
    public class CotizacionExtraBE
    {
        public int Id { get; set; }
        public int CotizacionId { get; set; }
        public int ServicioId { get; set; }

        public string ServicioNombre { get; set; }
        public string ServicioDescripcion { get; set; }
        public string ServicioTelefonoContacto { get; set; }
        public bool ServicioTienePrecioFijo { get; set; }
        public decimal? ServicioPrecio { get; set; }
        public bool ServicioActivo { get; set; }
    }

    // Lo que devuelve usp_cotizacion_listar (5 result sets)
    public class CotizacionListadoBE
    {
        public List<CotizacionBE> Cotizaciones { get; set; } = new List<CotizacionBE>();
        public List<PaqueteBE> Paquetes { get; set; } = new List<PaqueteBE>();
        public List<DistritoBE> Distritos { get; set; } = new List<DistritoBE>();
        public List<CotizacionMusicoBE> Musicos { get; set; } = new List<CotizacionMusicoBE>();
        public List<CotizacionExtraBE> Extras { get; set; } = new List<CotizacionExtraBE>();
    }
}
