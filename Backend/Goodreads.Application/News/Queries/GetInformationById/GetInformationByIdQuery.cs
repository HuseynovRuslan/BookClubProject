using Goodreads.Application.DTOs;
using MediatR;
using SharedKernel;

namespace Goodreads.Application.News.Queries.GetInformationById
{
    public record GetInformationByIdQuery(string Id) : IRequest<Result<InformationDto>>;
}
