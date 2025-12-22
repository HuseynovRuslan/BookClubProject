using Goodreads.Application.DTOs;
using MediatR;

namespace Goodreads.Application.News.Queries.GetInformationById
{
    public record GetInformationByIdQuery(string Id) : IRequest<InformationDto>;
}
