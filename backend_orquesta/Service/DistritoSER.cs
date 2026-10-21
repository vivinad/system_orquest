using AutoMapper;
using System.Collections.Generic;

namespace Service
{
    public class DistritoSER
    {
        private Data.DistritoDA objData;
        private readonly string cnBD = "";
        private readonly IMapper mapper;

        public DistritoSER(string cnBD, IMapper mapper)
        {
            this.cnBD = cnBD;
            this.mapper = mapper;
        }

        public List<DTO.DistritoDTO> getAll()
        {
            objData = new Data.DistritoDA(this.cnBD);
            List<Entity.DistritoBE> lista = objData.listar();
            return mapper.Map<List<DTO.DistritoDTO>>(lista);
        }

        public DTO.DistritoDTO getById(int id)
        {
            objData = new Data.DistritoDA(this.cnBD);
            Entity.DistritoBE entidad = objData.obtener(id);
            return entidad == null ? null : mapper.Map<DTO.DistritoDTO>(entidad);
        }

        // El admin puede ajustar el costo de movilidad
        public DTO.Result.Result<bool> modificar(DTO.DistritoDTO dto)
        {
            var result = new DTO.Result.Result<bool>();

            var entidad = mapper.Map<Entity.DistritoBE>(dto);
            objData = new Data.DistritoDA(this.cnBD);
            if (objData.actualizar(entidad) < 1)
            {
                result.errorCodigo = "NOEXISTE";
                result.errorMensaje = "El distrito no existe.";
                return result;
            }

            result.value = true;
            return result;
        }
    }
}
