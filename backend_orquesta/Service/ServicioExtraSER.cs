using AutoMapper;
using System.Collections.Generic;

namespace Service
{
    public class ServicioExtraSER
    {
        private Data.ServicioExtraDA objData;
        private readonly string cnBD = "";
        private readonly IMapper mapper;

        public ServicioExtraSER(string cnBD, IMapper mapper)
        {
            this.cnBD = cnBD;
            this.mapper = mapper;
        }

        public List<DTO.ServicioExtraDTO> getAll()
        {
            objData = new Data.ServicioExtraDA(this.cnBD);
            List<Entity.ServicioExtraBE> lista = objData.listar();
            return mapper.Map<List<DTO.ServicioExtraDTO>>(lista);
        }

        public DTO.ServicioExtraDTO getById(int id)
        {
            objData = new Data.ServicioExtraDA(this.cnBD);
            Entity.ServicioExtraBE entidad = objData.obtener(id);
            return entidad == null ? null : mapper.Map<DTO.ServicioExtraDTO>(entidad);
        }

        public DTO.Result.Result<DTO.ServicioExtraDTO> agregar(DTO.ServicioExtraDTO dto)
        {
            var result = new DTO.Result.Result<DTO.ServicioExtraDTO>();

            var entidad = mapper.Map<Entity.ServicioExtraBE>(dto);
            objData = new Data.ServicioExtraDA(this.cnBD);
            dto.Id = objData.insertar(entidad);

            result.value = dto;
            return result;
        }

        public DTO.Result.Result<bool> modificar(DTO.ServicioExtraDTO dto)
        {
            var result = new DTO.Result.Result<bool>();

            var entidad = mapper.Map<Entity.ServicioExtraBE>(dto);
            objData = new Data.ServicioExtraDA(this.cnBD);
            if (objData.actualizar(entidad) < 1)
            {
                result.errorCodigo = "NOEXISTE";
                result.errorMensaje = "El servicio no existe.";
                return result;
            }

            result.value = true;
            return result;
        }

        public DTO.Result.Result<bool> eliminar(int id)
        {
            var result = new DTO.Result.Result<bool>();

            objData = new Data.ServicioExtraDA(this.cnBD);
            if (objData.desactivar(id) < 1)
            {
                result.errorCodigo = "NOEXISTE";
                result.errorMensaje = "El servicio no existe.";
                return result;
            }

            result.value = true;
            return result;
        }
    }
}
