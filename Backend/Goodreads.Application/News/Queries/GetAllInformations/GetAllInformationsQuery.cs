using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using MediatR;

namespace Goodreads.Application.News.Queries.GetAllInformations
{
    public record GetAllInformationsQuery(QueryParameters Parameters) : IRequest<PagedResult<InformationDto>>;
}
