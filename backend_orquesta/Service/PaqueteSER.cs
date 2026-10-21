using AutoMapper;
using System.Collections.Generic;

namespace Service
{
    public class PaqueteSER
    {
        private Data.PaqueteDA objData;
        private readonly string cnBD = "";
        private readonly IMapper mapper;

        public PaqueteSER(string cnBD, IMapper mapper)
        {
            this.cnBD = cnBD;
            this.mapper = mapper;
        }

        public List<DTO.PaqueteDTO> getAll()
        {
            objData = new Data.PaqueteDA(this.cnBD);
            List<Entity.PaqueteBE> lista = objData.listar();
            return mapper.Map<List<DTO.PaqueteDTO>>(lista);
        }

        public List<DTO.PaqueteDTO> getOcultos()
        {
            objData = new Data.PaqueteDA(this.cnBD);
            List<Entity.PaqueteBE> lista = objData.listarInactivos();
            return mapper.Map<List<DTO.PaqueteDTO>>(lista);
        }

        public DTO.PaqueteDTO getById(int id)
        {
            objData = new Data.PaqueteDA(this.cnBD);
            Entity.PaqueteBE entidad = objData.obtener(id);
            return entidad == null ? null : mapper.Map<DTO.PaqueteDTO>(entidad);
        }

        public DTO.Result.Result<DTO.PaqueteDTO> agregar(DTO.PaqueteDTO dto)
        {
            var result = new DTO.Result.Result<DTO.PaqueteDTO>();

            var entidad = mapper.Map<Entity.PaqueteBE>(dto);
            objData = new Data.PaqueteDA(this.cnBD);
            dto.Id = objData.insertar(entidad);

            result.value = dto;
            return result;
        }

        public DTO.Result.Result<bool> modificar(DTO.PaqueteDTO dto)
        {
            var result = new DTO.Result.Result<bool>();

            var entidad = mapper.Map<Entity.PaqueteBE>(dto);
            objData = new Data.PaqueteDA(this.cnBD);
            if (objData.actualizar(entidad) < 1)
            {
                result.errorCodigo = "NOEXISTE";
                result.errorMensaje = "El paquete no existe.";
                return result;
            }

            result.value = true;
            return result;
        }

        // No se elimina, solo se desactiva
        public DTO.Result.Result<bool> eliminar(int id)
        {
            var result = new DTO.Result.Result<bool>();

            objData = new Data.PaqueteDA(this.cnBD);
            if (objData.desactivar(id) < 1)
            {
                result.errorCodigo = "NOEXISTE";
                result.errorMensaje = "El paquete no existe.";
                return result;
            }

            result.value = true;
            return result;
        }
    }
}
