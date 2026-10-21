using AutoMapper;
using System;
using System.Collections.Generic;

namespace Service
{
    public class EventoSER
    {
        private Data.EventoDA objData;
        private readonly string cnBD = "";
        private readonly IMapper mapper;

        public EventoSER(string cnBD, IMapper mapper)
        {
            this.cnBD = cnBD;
            this.mapper = mapper;
        }

        // Todos los activos (admin)
        public List<DTO.EventoDTO> getAll()
        {
            objData = new Data.EventoDA(this.cnBD);
            List<Entity.EventoBE> lista = objData.listar();
            return mapper.Map<List<DTO.EventoDTO>>(lista);
        }

        // Solo los que aún no pasan (página pública)
        public List<DTO.EventoDTO> getOcultos()
        {
            objData = new Data.EventoDA(this.cnBD);
            List<Entity.EventoBE> lista = objData.listarInactivos();
            return mapper.Map<List<DTO.EventoDTO>>(lista);
        }

        public List<DTO.EventoDTO> getVigentes()
        {
            objData = new Data.EventoDA(this.cnBD);
            List<Entity.EventoBE> lista = objData.listarVigentes(DateTime.Today);
            return mapper.Map<List<DTO.EventoDTO>>(lista);
        }

        public DTO.EventoDTO getById(int id)
        {
            objData = new Data.EventoDA(this.cnBD);
            Entity.EventoBE entidad = objData.obtener(id);
            return entidad == null ? null : mapper.Map<DTO.EventoDTO>(entidad);
        }

        public DTO.Result.Result<DTO.EventoDTO> agregar(DTO.EventoDTO dto)
        {
            var result = new DTO.Result.Result<DTO.EventoDTO>();

            var entidad = mapper.Map<Entity.EventoBE>(dto);
            objData = new Data.EventoDA(this.cnBD);
            dto.Id = objData.insertar(entidad);

            result.value = dto;
            return result;
        }

        public DTO.Result.Result<bool> modificar(DTO.EventoDTO dto)
        {
            var result = new DTO.Result.Result<bool>();

            var entidad = mapper.Map<Entity.EventoBE>(dto);
            objData = new Data.EventoDA(this.cnBD);
            if (objData.actualizar(entidad) < 1)
            {
                result.errorCodigo = "NOEXISTE";
                result.errorMensaje = "El evento no existe.";
                return result;
            }

            result.value = true;
            return result;
        }

        // No se elimina, solo se desactiva
        public DTO.Result.Result<bool> eliminar(int id)
        {
            var result = new DTO.Result.Result<bool>();

            objData = new Data.EventoDA(this.cnBD);
            if (objData.desactivar(id) < 1)
            {
                result.errorCodigo = "NOEXISTE";
                result.errorMensaje = "El evento no existe.";
                return result;
            }

            result.value = true;
            return result;
        }
    }
}
