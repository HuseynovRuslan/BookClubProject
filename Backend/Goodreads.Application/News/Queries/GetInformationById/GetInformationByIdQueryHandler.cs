using AutoMapper;
using Goodreads.Application.DTOs;
using Goodreads.Domain.Errors;
using MediatR;
using SharedKernel;

namespace Goodreads.Application.News.Queries.GetInformationById
{
    public class GetInformationByIdQueryHandler : IRequestHandler<GetInformationByIdQuery, Result<InformationDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetInformationByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<InformationDto>> Handle(GetInformationByIdQuery request, CancellationToken cancellationToken)
        {
            var information = await _unitOfWork.Informations.GetByIdAsync(request.Id);

            if (information == null)
                return Result<InformationDto>.Fail(InformationErrors.NotFound(request.Id));

            var dto = _mapper.Map<InformationDto>(information);
            return Result<InformationDto>.Ok(dto);
        }
    }
}
