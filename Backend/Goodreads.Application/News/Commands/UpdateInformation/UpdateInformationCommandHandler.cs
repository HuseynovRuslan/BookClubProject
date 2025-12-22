namespace Goodreads.Application.News.Commands.UpdateInformation;

public class UpdateInformationCommandHandler : IRequestHandler<UpdateInformationCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateInformationCommandHandler> _logger;
    private readonly IMapper _mapper;
    private readonly ILocalStorageService _localStorageService;

    public UpdateInformationCommandHandler(
    IUnitOfWork unitOfWork,
    ILogger<UpdateInformationCommandHandler> logger,
    IMapper mapper,
    ILocalStorageService localStorageService)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _mapper = mapper;
        _localStorageService = localStorageService;
    }

    public async Task<Result> Handle(UpdateInformationCommand request, CancellationToken cancellationToken)
    {
        var info = await _unitOfWork.Informations.GetByIdAsync(request.Id);

        if (info == null)
        {
            _logger.LogWarning("Information with ID: {InformationId} not found", request.Id);
            return Result.Fail(Error.NotFound("Error Update",$"Couldn't update information: {request.Id}"));
        }

        _mapper.Map(request, info);


        if (request.Title is not null)
            info.Title = request.Title;

        if (request.Content is not null)
            info.Content = request.Content;

        if (request.Details is not null)
            info.Details = request.Details;

        if (request.CoverImageUrl is not null)
            info.CoverImageUrl = request.CoverImageUrl;

        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Info with ID: {InformationId} updated successfully", request.Id);
        return Result.Ok();


    }
}
