using AutoMapper;
using Goodreads.Application.DTOs;
using Goodreads.Domain.Entities;

namespace Goodreads.Application.Notifications;

public class NotificationsMappingProfile : Profile
{
    public NotificationsMappingProfile()
    {
        CreateMap<Notification, NotificationDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => (NotificationTypeDto)(int)src.Type));
    }
}
