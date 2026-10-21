using AutoMapper;
using System.Collections.Generic;

namespace Service
{
    public class FinanzaSER
    {
        private Data.FinanzaDA objData;
        private readonly string cnBD = "";
        private readonly IMapper mapper;

        public FinanzaSER(string cnBD, IMapper mapper)
        {
            this.cnBD = cnBD;
            this.mapper = mapper;
        }

        public List<DTO.FinanzaDTO> getAll()
        {
            objData = new Data.FinanzaDA(this.cnBD);
            List<Entity.FinanzaBE> lista = objData.listar();
            return mapper.Map<List<DTO.FinanzaDTO>>(lista);
        }

        public DTO.ResumenFinanzaDTO getResumen()
        {
            objData = new Data.FinanzaDA(this.cnBD);
            Entity.ResumenFinanzaBE r = objData.resumen(null, null);
            return new DTO.ResumenFinanzaDTO
            {
                Ingresos = r.Ingresos,
                Gastos = r.Gastos,
                Balance = r.Ingresos - r.Gastos
            };
        }

        public DTO.ResumenFinanzaMesDTO getResumenMes(int anio, int mes)
        {
            objData = new Data.FinanzaDA(this.cnBD);
            Entity.ResumenFinanzaBE r = objData.resumen(anio, mes);
            return new DTO.ResumenFinanzaMesDTO
            {
                Anio = anio,
                Mes = mes,
                Ingresos = r.Ingresos,
                Gastos = r.Gastos,
                Balance = r.Ingresos - r.Gastos
            };
        }

        // idAdminToken: id del admin logueado (del token JWT); 0 si no viene
        public DTO.Result.Result<DTO.FinanzaDTO> agregar(DTO.FinanzaDTO dto, int idAdminToken)
        {
            var result = new DTO.Result.Result<DTO.FinanzaDTO>();

            if (dto.Monto <= 0)
            {
                result.errorCodigo = "VAL";
                result.errorMensaje = "El monto debe ser mayor a 0.";
                return result;
            }

            // El frontend no envía adminId: se toma del token del admin logueado,
            // o del primer admin activo como respaldo.
            if (dto.AdminId == 0)
            {
                if (idAdminToken > 0)
                {
                    dto.AdminId = idAdminToken;
                }
                else
                {
                    var objUsuario = new Data.UsuarioAdminDA(this.cnBD);
                    int idAdmin = objUsuario.obtenerPrimerActivo();
                    if (idAdmin == 0)
                    {
                        result.errorCodigo = "VAL";
                        result.errorMensaje = "No existe un administrador registrado.";
                        return result;
                    }
                    dto.AdminId = idAdmin;
                }
            }

            var entidad = mapper.Map<Entity.FinanzaBE>(dto);
            objData = new Data.FinanzaDA(this.cnBD);
            dto.Id = objData.insertar(entidad);

            result.value = dto;
            return result;
        }

        public DTO.Result.Result<bool> modificar(DTO.FinanzaDTO dto)
        {
            var result = new DTO.Result.Result<bool>();

            if (dto.Monto <= 0)
            {
                result.errorCodigo = "VAL";
                result.errorMensaje = "El monto debe ser mayor a 0.";
                return result;
            }

            var entidad = mapper.Map<Entity.FinanzaBE>(dto);
            objData = new Data.FinanzaDA(this.cnBD);
            if (objData.actualizar(entidad) < 1)
            {
                result.errorCodigo = "NOEXISTE";
                result.errorMensaje = "El movimiento no existe.";
                return result;
            }

            result.value = true;
            return result;
        }

        public DTO.Result.Result<bool> eliminar(int id)
        {
            var result = new DTO.Result.Result<bool>();

            objData = new Data.FinanzaDA(this.cnBD);
            if (objData.eliminar(id) < 1)
            {
                result.errorCodigo = "NOEXISTE";
                result.errorMensaje = "El movimiento no existe.";
                return result;
            }

            result.value = true;
            return result;
        }
    }
}
