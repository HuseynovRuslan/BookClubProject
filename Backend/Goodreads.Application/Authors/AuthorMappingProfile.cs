using Goodreads.Application.Authors.Commands.CreateAuthor;

namespace Goodreads.Application.Authors;
internal class AuthorMappingProfile : Profile
{
    public AuthorMappingProfile()
    {
        CreateMap<Author, AuthorDto>()
            .ForMember(dest => dest.BookCount, opt => opt.MapFrom(src => src.Books != null ? src.Books.Count : 0));
        CreateMap<CreateAuthorCommand, Author>();
    }
}

