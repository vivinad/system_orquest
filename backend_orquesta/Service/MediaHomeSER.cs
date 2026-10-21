using AutoMapper;
using System.Collections.Generic;
using System.Linq;

namespace Service
{
    public class MediaHomeSER
    {
        private Data.MediaHomeDA objData;
        private readonly string cnBD = "";
        private readonly IMapper mapper;

        public MediaHomeSER(string cnBD, IMapper mapper)
        {
            this.cnBD = cnBD;
            this.mapper = mapper;
        }

        public List<DTO.MediaHomeDTO> getAll(string tipo)
        {
            objData = new Data.MediaHomeDA(this.cnBD);
            List<Entity.MediaHomeBE> lista = objData.listar(tipo);
            return mapper.Map<List<DTO.MediaHomeDTO>>(lista);
        }

        public DTO.Result.Result<DTO.MediaHomeDTO> agregar(DTO.MediaHomeDTO dto)
        {
            var result = new DTO.Result.Result<DTO.MediaHomeDTO>();

            if (!global::Type.MediaHome.TiposValidos.Contains(dto.Tipo))
            {
                result.errorCodigo = "VAL";
                result.errorMensaje = "Tipo no válido: debe ser 'video' o 'foto'.";
                return result;
            }
            if (string.IsNullOrWhiteSpace(dto.Valor))
            {
                result.errorCodigo = "VAL";
                result.errorMensaje = "El valor es obligatorio.";
                return result;
            }

            var entidad = mapper.Map<Entity.MediaHomeBE>(dto);
            objData = new Data.MediaHomeDA(this.cnBD);
            Entity.MediaHomeBE creado = objData.insertar(entidad);

            result.value = mapper.Map<DTO.MediaHomeDTO>(creado);
            return result;
        }

        public DTO.Result.Result<bool> cambiarOrden(DTO.MediaOrdenDTO dto)
        {
            var result = new DTO.Result.Result<bool>();
            if (dto?.Ids == null || dto.Ids.Count == 0)
            {
                result.errorCodigo = "VAL";
                result.errorMensaje = "Envía los ids en el nuevo orden.";
                return result;
            }

            objData = new Data.MediaHomeDA(this.cnBD);
            objData.cambiarOrden(dto.Ids);
            result.value = true;
            return result;
        }

        public DTO.Result.Result<bool> eliminar(int id)
        {
            var result = new DTO.Result.Result<bool>();

            objData = new Data.MediaHomeDA(this.cnBD);
            if (objData.eliminar(id) < 1)
            {
                result.errorCodigo = "NOEXISTE";
                result.errorMensaje = "El elemento no existe.";
                return result;
            }

            result.value = true;
            return result;
        }
    }
}
