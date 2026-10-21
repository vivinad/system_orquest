using System.ComponentModel.DataAnnotations;
using System;
using System.Collections.Generic;

namespace DTO
{
    // Cotización guardada (vista admin y respuesta al crear)
    public class CotizacionDTO
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

        // Clave que recibe el cliente al crear la cotización: la necesita para descargar su contrato
        public Guid? CodigoAcceso { get; set; }

        public PaqueteDTO Paquete { get; set; }
        public DistritoDTO Distrito { get; set; }
        public List<CotizacionMusicoDTO> Musicos { get; set; } = new List<CotizacionMusicoDTO>();
        public List<CotizacionExtraDTO> Extras { get; set; } = new List<CotizacionExtraDTO>();
    }

    public class CotizacionMusicoDTO
    {
        public int Id { get; set; }
        public int CotizacionId { get; set; }
        public int MusicoId { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioAplicado { get; set; }
        public MusicoAdicionalDTO Musico { get; set; }
    }

    public class CotizacionExtraDTO
    {
        public int Id { get; set; }
        public int CotizacionId { get; set; }
        public int ServicioId { get; set; }
        public ServicioExtraDTO Servicio { get; set; }
    }

    // ---------- Lo que envía el cliente al cotizar ----------
    public class CotizacionRequestDTO
    {
        [Required]
        public string NombreCliente { get; set; } = string.Empty;
        [Required]
        public string TelefonoCliente { get; set; } = string.Empty;
        public string EmailCliente { get; set; }
        public string DniCliente { get; set; }
        public string DireccionCliente { get; set; }
        public int PaqueteId { get; set; }
        public int DistritoId { get; set; }
        [Required]
        public string FechaEvento { get; set; } = string.Empty; // 'YYYY-MM-DD'
        public string DireccionEvento { get; set; }
        public string HoraInicio { get; set; }
        public string TipoEvento { get; set; }
        public int HorasSolicitadas { get; set; }
        public List<MusicoSeleccionDTO> Musicos { get; set; } = new List<MusicoSeleccionDTO>();
        public List<int> ServiciosExtra { get; set; } = new List<int>();
        public string Observaciones { get; set; }
    }

    // ---------- Lo que envía el admin al editar una cotización ----------
    public class CotizacionEdicionDTO : CotizacionRequestDTO
    {
        // Precio final acordado con el cliente (por WhatsApp). Si viene, reemplaza al total calculado
        // y la cotización deja de estar "a tratar".
        public decimal? MontoAcordado { get; set; }
    }

    public class MusicoSeleccionDTO
    {
        public int MusicoId { get; set; }
        public int Cantidad { get; set; }
    }

    // ---------- Resultado de api/cotizacion/calcular ----------
    public class CotizacionResultadoDTO
    {
        public string DiaSemana { get; set; } = string.Empty;
        public decimal CostoPaquete { get; set; }
        public decimal CostoMusicosExtra { get; set; }
        public decimal CostoMovilidad { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Total { get; set; }
        public bool TieneATratar { get; set; }
        public string MotivoATratar { get; set; }
        public List<MusicoDetalleDTO> MusicosDetalle { get; set; } = new List<MusicoDetalleDTO>();
    }

    public class MusicoDetalleDTO
    {
        public int MusicoId { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioAplicado { get; set; }
    }

    // api/cotizacion/{id}/estado
    public class CambioEstadoDTO
    {
        [Required]
        public string Estado { get; set; } = string.Empty;
        public string Observaciones { get; set; }
    }
}
