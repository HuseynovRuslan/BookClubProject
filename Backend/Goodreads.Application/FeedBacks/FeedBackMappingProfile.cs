namespace Goodreads.Application.FeedBacks;

public class FeedBackMappingProfile : Profile
{
    public FeedBackMappingProfile()
    {
        CreateMap<FeedBack, FeedBackDto>()
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User.UserName));
    }
}
