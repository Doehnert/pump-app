using AutoMapper;
using pump_api.Dtos.Pump;
using pump_api.Models;

namespace pump_api
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // Pump mappings can be added here when DTOs are created
            CreateMap<Pump, GetPumpDto>();
            CreateMap<AddPumpDto, Pump>();
            CreateMap<UpdatePumpDto, Pump>();
        }
    }
}