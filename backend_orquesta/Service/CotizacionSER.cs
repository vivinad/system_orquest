using AutoMapper;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;

namespace Service
{
    public class CotizacionSER
    {
        private Data.CotizacionDA objData;
        private readonly string cnBD = "";
        private readonly IMapper mapper;

        public CotizacionSER(string cnBD, IMapper mapper)
        {
            this.cnBD = cnBD;
            this.mapper = mapper;
        }

        // ---------- Previsualizar el precio (no guarda nada) ----------
        public DTO.Result.Result<DTO.CotizacionResultadoDTO> calcular(DTO.CotizacionRequestDTO req)
        {
            var result = new DTO.Result.Result<DTO.CotizacionResultadoDTO>();

            if (!leerFecha(req.FechaEvento, out DateTime fecha))
            {
                result.errorCodigo = "VAL";
                result.errorMensaje = "Fecha no válida.";
                return result;
            }

            var resultado = calcularInterno(req, fecha);
            if (resultado == null)
            {
                result.errorCodigo = "VAL";
                result.errorMensaje = "Paquete o distrito no válido.";
                return result;
            }

            result.value = resultado;
            return result;
        }

        // ---------- ¿La orquesta ya tiene un evento asegurado ese día? ----------
        public DTO.Result.Result<bool> fechaOcupada(string fecha)
        {
            var result = new DTO.Result.Result<bool>();

            if (!DateTime.TryParse(fecha, out DateTime dia))
            {
                result.errorCodigo = "VAL";
                result.errorMensaje = "Fecha no válida.";
                return result;
            }

            objData = new Data.CotizacionDA(this.cnBD);
            result.value = objData.fechaOcupada(dia, global::Type.Cotizacion.EstadosOcupados);
            return result;
        }

        // ---------- Crear la cotización (estado 'pendiente') ----------
        public DTO.Result.Result<DTO.CotizacionDTO> crear(DTO.CotizacionRequestDTO req)
        {
            var result = new DTO.Result.Result<DTO.CotizacionDTO>();

            if (!leerFecha(req.FechaEvento, out DateTime fechaEvento))
            {
                result.errorCodigo = "VAL";
                result.errorMensaje = "Fecha no válida.";
                return result;
            }

            var r = calcularInterno(req, fechaEvento);
            if (r == null)
            {
                result.errorCodigo = "VAL";
                result.errorMensaje = "Paquete o distrito no válido.";
                return result;
            }

            // No se aceptan cotizaciones para un día con contrato ya asegurado
            objData = new Data.CotizacionDA(this.cnBD);
            if (objData.fechaOcupada(fechaEvento, global::Type.Cotizacion.EstadosOcupados))
            {
                result.errorCodigo = "CONFLICTO";
                result.errorMensaje = "La orquesta ya tiene un evento confirmado ese día.";
                return result;
            }

            var entidad = new Entity.CotizacionBE
            {
                NombreCliente = req.NombreCliente,
                TelefonoCliente = req.TelefonoCliente,
                EmailCliente = req.EmailCliente,
                DniCliente = req.DniCliente,
                DireccionCliente = req.DireccionCliente,
                PaqueteId = req.PaqueteId,
                DistritoId = req.DistritoId,
                FechaEvento = fechaEvento,
                DireccionEvento = req.DireccionEvento,
                HoraInicio = req.HoraInicio,
                TipoEvento = req.TipoEvento,
                DiaSemana = r.DiaSemana,
                HorasSolicitadas = req.HorasSolicitadas,
                CostoPaquete = r.CostoPaquete,
                CostoMusicosExtra = r.CostoMusicosExtra,
                CostoMovilidad = r.CostoMovilidad,
                Subtotal = r.Subtotal,
                Total = r.Total,
                Estado = global::Type.Cotizacion.Estado.Pendiente,
                TieneATratar = r.TieneATratar,
                MotivoATratar = r.MotivoATratar,
                Observaciones = req.Observaciones,
            };

            var musicos = r.MusicosDetalle.Select(m => new Entity.CotizacionMusicoBE
            {
                MusicoId = m.MusicoId,
                Cantidad = m.Cantidad,
                PrecioAplicado = m.PrecioAplicado,
            }).ToList();

            int id = objData.insertar(entidad, musicos, req.ServiciosExtra ?? new List<int>());

            result.value = getById(id);
            return result;
        }

        // ---------- Admin ----------
        public List<DTO.CotizacionDTO> getAll(string estado)
        {
            objData = new Data.CotizacionDA(this.cnBD);
            // Las confirmadas/pagadas cuya fecha ya pasó quedan como 'realizada'
            objData.marcarRealizadas(DateTime.Today);
            Entity.CotizacionListadoBE listado = objData.listar(null, estado);
            return armar(listado);
        }

        public DTO.CotizacionDTO getById(int id)
        {
            objData = new Data.CotizacionDA(this.cnBD);
            Entity.CotizacionListadoBE listado = objData.listar(id, null);
            return armar(listado).FirstOrDefault();
        }

        // ---------- Editar una cotización (admin) ----------
        // Recalcula los costos con los datos nuevos. Si el admin indica un monto acordado
        // (lo "a tratar" ya se conversó por WhatsApp), ese pasa a ser el total.
        // El contrato PDF se vuelve a generar en la próxima descarga con los datos nuevos.
        public DTO.Result.Result<DTO.CotizacionDTO> actualizar(int id, DTO.CotizacionEdicionDTO req)
        {
            var result = new DTO.Result.Result<DTO.CotizacionDTO>();

            if (!leerFecha(req.FechaEvento, out DateTime fechaEvento))
            {
                result.errorCodigo = "VAL";
                result.errorMensaje = "Fecha no válida.";
                return result;
            }
            if (req.MontoAcordado.HasValue && req.MontoAcordado.Value <= 0)
            {
                result.errorCodigo = "VAL";
                result.errorMensaje = "El monto acordado debe ser mayor a 0.";
                return result;
            }

            var r = calcularInterno(req, fechaEvento);
            if (r == null)
            {
                result.errorCodigo = "VAL";
                result.errorMensaje = "Paquete o distrito no válido.";
                return result;
            }

            bool hayAcuerdo = req.MontoAcordado.HasValue;
            var entidad = new Entity.CotizacionBE
            {
                Id = id,
                NombreCliente = req.NombreCliente,
                TelefonoCliente = req.TelefonoCliente,
                EmailCliente = req.EmailCliente,
                DniCliente = req.DniCliente,
                DireccionCliente = req.DireccionCliente,
                PaqueteId = req.PaqueteId,
                DistritoId = req.DistritoId,
                FechaEvento = fechaEvento,
                DireccionEvento = req.DireccionEvento,
                HoraInicio = req.HoraInicio,
                TipoEvento = req.TipoEvento,
                DiaSemana = r.DiaSemana,
                HorasSolicitadas = req.HorasSolicitadas,
                CostoPaquete = r.CostoPaquete,
                CostoMusicosExtra = r.CostoMusicosExtra,
                CostoMovilidad = r.CostoMovilidad,
                Subtotal = r.Subtotal,
                Total = hayAcuerdo ? req.MontoAcordado.Value : r.Total,
                // Con monto acordado ya no queda nada "a tratar"; el motivo se conserva como referencia
                TieneATratar = !hayAcuerdo && r.TieneATratar,
                MotivoATratar = r.MotivoATratar,
                Observaciones = req.Observaciones,
            };

            var musicos = r.MusicosDetalle.Select(m => new Entity.CotizacionMusicoBE
            {
                MusicoId = m.MusicoId,
                Cantidad = m.Cantidad,
                PrecioAplicado = m.PrecioAplicado,
            }).ToList();

            objData = new Data.CotizacionDA(this.cnBD);
            if (objData.actualizar(entidad, musicos, req.ServiciosExtra ?? new List<int>()) < 1)
            {
                result.errorCodigo = "NOEXISTE";
                result.errorMensaje = "La cotización no existe.";
                return result;
            }

            result.value = getById(id);
            return result;
        }

        public DTO.Result.Result<bool> cambiarEstado(int id, DTO.CambioEstadoDTO dto)
        {
            var result = new DTO.Result.Result<bool>();

            objData = new Data.CotizacionDA(this.cnBD);
            if (objData.cambiarEstado(id, dto.Estado, dto.Observaciones) < 1)
            {
                result.errorCodigo = "NOEXISTE";
                result.errorMensaje = "La cotización no existe.";
                return result;
            }

            result.value = true;
            return result;
        }

        // ---------- Contrato PDF: se genera con los datos actuales y se guarda una copia ----------
        // El admin (con sesión) puede descargar cualquiera; el cliente solo el suyo, con el
        // código de acceso que recibió al crear la cotización.
        public DTO.Result.Result<byte[]> obtenerContrato(int id, Guid? codigoAcceso, bool esAdmin, string carpetaRaiz)
        {
            var result = new DTO.Result.Result<byte[]>();

            DTO.CotizacionDTO cotizacion = getById(id);
            bool accesoValido = esAdmin
                || (cotizacion != null && codigoAcceso.HasValue && cotizacion.CodigoAcceso == codigoAcceso);

            // Mismo error si no existe o si el código no corresponde: no se revela qué cotizaciones existen
            if (cotizacion == null || !accesoValido)
            {
                result.errorCodigo = "NOEXISTE";
                result.errorMensaje = "La cotización no existe.";
                return result;
            }

            var objContrato = new Data.ContratoPdfDA(this.cnBD);
            Entity.ContratoPdfBE contratoExistente = objContrato.obtenerPorCotizacion(id);

            // Se genera siempre con los datos actuales (si el admin editó la cotización, el
            // contrato sale actualizado) y se guarda una copia en Storage/Contratos.
            byte[] pdfBytes = new ContratoPdfSER().Generar(cotizacion);

            string rutaRelativa = Path.Combine("Storage", "Contratos", $"contrato-{id}.pdf");
            string rutaAbsoluta = Path.Combine(carpetaRaiz, rutaRelativa);
            Directory.CreateDirectory(Path.GetDirectoryName(rutaAbsoluta));
            File.WriteAllBytes(rutaAbsoluta, pdfBytes);

            if (contratoExistente == null)
            {
                objContrato.insertar(id, rutaRelativa);
            }

            result.value = pdfBytes;
            return result;
        }

        // ---------- Cálculo (misma lógica que el frontend en modo demo) ----------
        private DTO.CotizacionResultadoDTO calcularInterno(DTO.CotizacionRequestDTO req, DateTime fecha)
        {
            Entity.PaqueteBE paquete = new Data.PaqueteDA(this.cnBD).obtener(req.PaqueteId);
            Entity.DistritoBE distrito = new Data.DistritoDA(this.cnBD).obtener(req.DistritoId);
            if (paquete == null || distrito == null) return null;

            int horas = req.HorasSolicitadas;
            var motivos = new List<string>();

            int horasBase = paquete.HorasBase > 0 ? paquete.HorasBase : 5;
            decimal precioPorHora = paquete.PrecioBase / horasBase;
            decimal costoPaquete = Math.Round(precioPorHora * horas, 2);

            if (Common.Fecha.EsFinDeSemana(fecha) && horas == 4)
                motivos.Add("Un evento de 4 horas en fin de semana se coordina directamente con la encargada.");

            decimal costoMusicos = 0;
            var detalle = new List<DTO.MusicoDetalleDTO>();
            var objMusico = new Data.MusicoAdicionalDA(this.cnBD);
            foreach (var sel in req.Musicos ?? new List<DTO.MusicoSeleccionDTO>())
            {
                if (sel.Cantidad <= 0) continue;
                Entity.MusicoAdicionalBE m = objMusico.obtener(sel.MusicoId);
                if (m == null) continue;
                costoMusicos += m.PrecioAdicional * sel.Cantidad;
                detalle.Add(new DTO.MusicoDetalleDTO { MusicoId = m.Id, Cantidad = sel.Cantidad, PrecioAplicado = m.PrecioAdicional });
            }

            if (distrito.EsATratar)
                motivos.Add($"El distrito '{distrito.Nombre}' está fuera de Lima Metropolitana; la movilidad se coordina directamente.");

            var objServicio = new Data.ServicioExtraDA(this.cnBD);
            foreach (var idServicio in req.ServiciosExtra ?? new List<int>())
            {
                Entity.ServicioExtraBE s = objServicio.obtener(idServicio);
                if (s != null && !s.TienePrecioFijo)
                    motivos.Add($"El servicio '{s.Nombre}' se coordina/cotiza directamente con el proveedor.");
            }

            decimal movilidad = distrito.CostoMovilidad;
            decimal subtotal = costoPaquete + costoMusicos + movilidad;

            return new DTO.CotizacionResultadoDTO
            {
                DiaSemana = Common.Fecha.DiaSemana(fecha),
                CostoPaquete = costoPaquete,
                CostoMusicosExtra = costoMusicos,
                CostoMovilidad = movilidad,
                Subtotal = subtotal,
                Total = subtotal,
                TieneATratar = motivos.Count > 0,
                MotivoATratar = motivos.Count > 0 ? string.Join(" ", motivos) : null,
                MusicosDetalle = detalle,
            };
        }

        // Fecha 'YYYY-MM-DD' que envía el frontend
        private static bool leerFecha(string texto, out DateTime fecha)
        {
            return DateTime.TryParse(texto, CultureInfo.InvariantCulture, DateTimeStyles.None, out fecha);
        }

        // Une los 5 result sets de usp_cotizacion_listar en cotizaciones con su paquete,
        // distrito, músicos y servicios extra (misma forma de JSON que antes).
        private List<DTO.CotizacionDTO> armar(Entity.CotizacionListadoBE listado)
        {
            var lista = mapper.Map<List<DTO.CotizacionDTO>>(listado.Cotizaciones);

            foreach (var c in lista)
            {
                var paquete = listado.Paquetes.FirstOrDefault(p => p.Id == c.PaqueteId);
                var distrito = listado.Distritos.FirstOrDefault(d => d.Id == c.DistritoId);

                c.Paquete = paquete == null ? null : mapper.Map<DTO.PaqueteDTO>(paquete);
                c.Distrito = distrito == null ? null : mapper.Map<DTO.DistritoDTO>(distrito);
                c.Musicos = mapper.Map<List<DTO.CotizacionMusicoDTO>>(listado.Musicos.Where(m => m.CotizacionId == c.Id).ToList());
                c.Extras = mapper.Map<List<DTO.CotizacionExtraDTO>>(listado.Extras.Where(e => e.CotizacionId == c.Id).ToList());
            }

            return lista;
        }
    }
}
