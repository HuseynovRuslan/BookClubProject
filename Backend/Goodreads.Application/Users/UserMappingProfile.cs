namespace Goodreads.Application.Users;
public class UserMappingProfile : Profile
{
    public UserMappingProfile()
    {
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.ProfilePictureUrl, opt => opt.MapFrom(src => 
                string.IsNullOrEmpty(src.ProfilePictureUrl) 
                    ? "/images/default-profile.png" 
                    : src.ProfilePictureUrl));

        CreateMap<User, UserProfileDto>()
            .ForMember(dest => dest.ProfilePictureUrl, opt => opt.MapFrom(src => 
                string.IsNullOrEmpty(src.ProfilePictureUrl) 
                    ? "/images/default-profile.png" 
                    : src.ProfilePictureUrl));

        CreateMap<Social, SocialDto>();
    }
}
