using AutoMapper;
using DTO;
using Entity;

namespace WebApiOrquesta
{
    // Conversión BE (Entity) <-> DTO. Al agregar una entidad nueva, registrar aquí su mapeo.
    public class AutomapperHelper : Profile
    {
        public AutomapperHelper()
        {
            CreateMap<PaqueteBE, PaqueteDTO>().ReverseMap();
            CreateMap<MusicoAdicionalBE, MusicoAdicionalDTO>().ReverseMap();
            CreateMap<DistritoBE, DistritoDTO>().ReverseMap();
            CreateMap<ServicioExtraBE, ServicioExtraDTO>().ReverseMap();
            CreateMap<EventoBE, EventoDTO>().ReverseMap();
            CreateMap<MediaHomeBE, MediaHomeDTO>().ReverseMap();
            CreateMap<FinanzaBE, FinanzaDTO>().ReverseMap();

            // Cotización: el paquete, distrito, músicos y extras los arma CotizacionSER
            CreateMap<CotizacionBE, CotizacionDTO>()
                .ForMember(d => d.Paquete, o => o.Ignore())
                .ForMember(d => d.Distrito, o => o.Ignore())
                .ForMember(d => d.Musicos, o => o.Ignore())
                .ForMember(d => d.Extras, o => o.Ignore());

            CreateMap<CotizacionMusicoBE, CotizacionMusicoDTO>()
                .ForMember(d => d.Musico, o => o.MapFrom(s => new MusicoAdicionalDTO
                {
                    Id = s.MusicoId,
                    Nombre = s.MusicoNombre,
                    Tipo = s.MusicoTipo,
                    PrecioAdicional = s.MusicoPrecioAdicional,
                    Activo = s.MusicoActivo
                }));

            CreateMap<CotizacionExtraBE, CotizacionExtraDTO>()
                .ForMember(d => d.Servicio, o => o.MapFrom(s => new ServicioExtraDTO
                {
                    Id = s.ServicioId,
                    Nombre = s.ServicioNombre,
                    Descripcion = s.ServicioDescripcion,
                    TelefonoContacto = s.ServicioTelefonoContacto,
                    TienePrecioFijo = s.ServicioTienePrecioFijo,
                    Precio = s.ServicioPrecio,
                    Activo = s.ServicioActivo
                }));
        }
    }
}
