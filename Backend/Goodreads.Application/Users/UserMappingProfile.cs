namespace Goodreads.Application.Users;
public class UserMappingProfile : Profile
{
    public UserMappingProfile()
    {
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.ProfilePictureUrl, opt => opt.MapFrom(src => 
                string.IsNullOrEmpty(src.ProfilePictureUrl) 
                    ? "/images/default-profile.png" 
                    : src.ProfilePictureUrl))
            // Role is set manually in query handlers using UserManager.GetRolesAsync()
            .ForMember(dest => dest.Role, opt => opt.Ignore());

        CreateMap<User, UserProfileDto>()
            .ForMember(dest => dest.ProfilePictureUrl, opt => opt.MapFrom(src => 
                string.IsNullOrEmpty(src.ProfilePictureUrl) 
                    ? "/images/default-profile.png" 
                    : src.ProfilePictureUrl))
            // Role is set manually in query handlers using UserManager.GetRolesAsync()
            .ForMember(dest => dest.Role, opt => opt.Ignore());

        CreateMap<Social, SocialDto>();
    }
}
