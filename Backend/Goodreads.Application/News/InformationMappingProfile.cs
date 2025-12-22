using Goodreads.Application.Books.Commands.UpdateBook;
using Goodreads.Application.News.Commands.CreateNews;

public class InformationMappingProfile : Profile
{
    public InformationMappingProfile()
    {
        CreateMap<CreateInformationCommand, Information>();
        CreateMap<Information, InformationDto>();
        CreateMap<UpdateInformationCommand, Information>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Title, opt => opt.Ignore())
            .ForMember(dest => dest.Content, opt => opt.Ignore())
            .ForMember(dest => dest.Details, opt => opt.Ignore())
            .ForMember(dest => dest.IsRead, opt => opt.Ignore())
            .ForMember(dest => dest.CoverImageUrl, opt => opt.Ignore())
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

    }
}
