using AutoMapper;
using Goodreads.Application.Books.Commands.CreateBook;
using Goodreads.Application.Books.Commands.UpdateBook;
using Goodreads.Domain.Entities;

namespace Goodreads.Application.Common.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<CreateBookCommand, Book>()
                .ForMember(dest => dest.CoverImageUrl, opt => opt.Ignore())
                .ForMember(dest => dest.CoverImageBlobName, opt => opt.Ignore())
                .ForMember(dest => dest.Author, opt => opt.Ignore())
                .ForMember(dest => dest.BookGenres, opt => opt.Ignore());

            CreateMap<UpdateBookCommand, Book>()
                .ForMember(dest => dest.CoverImageUrl, opt => opt.Ignore())
                .ForMember(dest => dest.CoverImageBlobName, opt => opt.Ignore())
                .ForMember(dest => dest.Author, opt => opt.Ignore())
                .ForMember(dest => dest.BookGenres, opt => opt.Ignore());
        }

    }
}
