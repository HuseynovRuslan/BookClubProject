using AutoMapper;
using Goodreads.Application.Common;
using Goodreads.Application.Common.Responses;
using Goodreads.Domain.Entities;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Goodreads.Application.News.Commands.CreateNews;

public class CreateInformationCommandHandler : IRequestHandler<CreateInformationCommand, Result<string>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<CreateInformationCommandHandler> _logger;

    public CreateInformationCommandHandler(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<CreateInformationCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<string>> Handle(CreateInformationCommand request, CancellationToken cancellationToken)
    {
        var information = _mapper.Map<Information>(request);

        await _unitOfWork.Informations.AddAsync(information);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Information created successfully with ID: {InformationId}", information.Id);

        return Result<string>.Ok(information.Id);
    }
}
