using AutoMapper;
using Goodreads.Application.DTOs;
using MediatR;

namespace Goodreads.Application.News.Queries.GetInformationById
{
    public class GetInformationByIdQueryHandler : IRequestHandler<GetInformationByIdQuery, InformationDto>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetInformationByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<InformationDto> Handle(GetInformationByIdQuery request, CancellationToken cancellationToken)
        {
            var information = await _unitOfWork.Informations.GetByIdAsync(request.Id);

            if (information == null)
                throw new Exception("Information not found");

            return _mapper.Map<InformationDto>(information);
        }
    }
}
