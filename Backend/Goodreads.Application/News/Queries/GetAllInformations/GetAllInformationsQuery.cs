using Goodreads.Application.DTOs;
using MediatR;
using System.Collections.Generic;

namespace Goodreads.Application.News.Queries.GetAllInformations
{
    public record GetAllInformationsQuery() : IRequest<List<InformationDto>>;
}
