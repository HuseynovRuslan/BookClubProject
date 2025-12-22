using AutoMapper;
using Goodreads.Application.DTOs;
using MediatR;
using SharedKernel;

namespace Goodreads.Application.News.Queries.GetAllInformations
{
    public class GetAllInformationsQueryHandler : IRequestHandler<GetAllInformationsQuery, List<InformationDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetAllInformationsQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<List<InformationDto>> Handle(GetAllInformationsQuery request, CancellationToken cancellationToken)
        {
            var informations = await _unitOfWork.Informations.GetAllAsync();

            // Sort by CreatedAt descending
            return informations
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => _mapper.Map<InformationDto>(x))
                .ToList();
        }
    }
}
