namespace Goodreads.Application.Reviews;
public class ReviewsMappingProfile : Profile
{
    public ReviewsMappingProfile()
    {
        CreateMap<BookReview, BookReviewDto>()
            .ForMember(dest => dest.BookTitle, opt => opt.MapFrom(src => src.Book != null ? src.Book.Title : null))
            .ForMember(dest => dest.BookCoverImageUrl, opt => opt.MapFrom(src => src.Book != null ? src.Book.CoverImageUrl : null))
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.UserName : null))
            .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.User != null ? src.User.FirstName : null))
            .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.User != null ? src.User.LastName : null))
            .ForMember(dest => dest.UserProfilePictureUrl, opt => opt.MapFrom(src => src.User != null ? src.User.ProfilePictureUrl : null));
    }
}
