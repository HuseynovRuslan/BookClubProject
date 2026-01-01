using AutoMapper;
using Goodreads.Application.DTOs;
using Goodreads.Domain.Entities;

namespace Goodreads.Application.Comments;

public class CommentsMappingProfile : Profile
{
    public CommentsMappingProfile()
    {
        CreateMap<Comment, CommentDto>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.UserName))
            .ForMember(dest => dest.UserProfilePicture, opt => opt.MapFrom(src => src.User.ProfilePictureUrl));
    }
}
