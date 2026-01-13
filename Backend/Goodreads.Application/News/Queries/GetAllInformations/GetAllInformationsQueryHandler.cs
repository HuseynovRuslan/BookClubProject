using AutoMapper;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using MediatR;
using SharedKernel;

namespace Goodreads.Application.News.Queries.GetAllInformations
{
    public class GetAllInformationsQueryHandler : IRequestHandler<GetAllInformationsQuery, PagedResult<InformationDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetAllInformationsQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<PagedResult<InformationDto>> Handle(GetAllInformationsQuery request, CancellationToken cancellationToken)
        {
            var pageNumber = request.Parameters.PageNumber ?? 1;
            var pageSize = request.Parameters.PageSize ?? 10;

            var (items, count) = await _unitOfWork.Informations.GetAllAsync(
                pageNumber: pageNumber,
                pageSize: pageSize,
                sortColumn: "CreatedAt",
                sortOrder: "desc"
            );

            var dtos = _mapper.Map<List<InformationDto>>(items);

            return PagedResult<InformationDto>.Create(dtos, pageNumber, pageSize, count);
        }
    }
}
