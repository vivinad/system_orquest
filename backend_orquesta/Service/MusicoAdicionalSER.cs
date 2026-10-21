using AutoMapper;
using System.Collections.Generic;

namespace Service
{
    public class MusicoAdicionalSER
    {
        private Data.MusicoAdicionalDA objData;
        private readonly string cnBD = "";
        private readonly IMapper mapper;

        public MusicoAdicionalSER(string cnBD, IMapper mapper)
        {
            this.cnBD = cnBD;
            this.mapper = mapper;
        }

        public List<DTO.MusicoAdicionalDTO> getAll()
        {
            objData = new Data.MusicoAdicionalDA(this.cnBD);
            List<Entity.MusicoAdicionalBE> lista = objData.listar();
            return mapper.Map<List<DTO.MusicoAdicionalDTO>>(lista);
        }

        public DTO.MusicoAdicionalDTO getById(int id)
        {
            objData = new Data.MusicoAdicionalDA(this.cnBD);
            Entity.MusicoAdicionalBE entidad = objData.obtener(id);
            return entidad == null ? null : mapper.Map<DTO.MusicoAdicionalDTO>(entidad);
        }

        public DTO.Result.Result<DTO.MusicoAdicionalDTO> agregar(DTO.MusicoAdicionalDTO dto)
        {
            var result = new DTO.Result.Result<DTO.MusicoAdicionalDTO>();

            var entidad = mapper.Map<Entity.MusicoAdicionalBE>(dto);
            objData = new Data.MusicoAdicionalDA(this.cnBD);
            dto.Id = objData.insertar(entidad);

            result.value = dto;
            return result;
        }

        public DTO.Result.Result<bool> modificar(DTO.MusicoAdicionalDTO dto)
        {
            var result = new DTO.Result.Result<bool>();

            var entidad = mapper.Map<Entity.MusicoAdicionalBE>(dto);
            objData = new Data.MusicoAdicionalDA(this.cnBD);
            if (objData.actualizar(entidad) < 1)
            {
                result.errorCodigo = "NOEXISTE";
                result.errorMensaje = "El músico no existe.";
                return result;
            }

            result.value = true;
            return result;
        }

        public DTO.Result.Result<bool> eliminar(int id)
        {
            var result = new DTO.Result.Result<bool>();

            objData = new Data.MusicoAdicionalDA(this.cnBD);
            if (objData.desactivar(id) < 1)
            {
                result.errorCodigo = "NOEXISTE";
                result.errorMensaje = "El músico no existe.";
                return result;
            }

            result.value = true;
            return result;
        }
    }
}
