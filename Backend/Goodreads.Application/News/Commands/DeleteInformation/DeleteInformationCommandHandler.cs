namespace Goodreads.Application.News.Commands.DeleteInformation;

public class DeleteInformationCommandHandler : IRequestHandler<DeleteInformationCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DeleteInformationCommandHandler> _logger;

    public DeleteInformationCommandHandler(IUnitOfWork unitOfWork, ILogger<DeleteInformationCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteInformationCommand request, CancellationToken cancellationToken)
    {
        var info = await _unitOfWork.Informations.GetByIdAsync(request.Id);

        if (info == null)
        {
            _logger.LogWarning("Information with ID: {InformationId} not found", request.Id);
            return Result.Fail(InformationErrors.NotFound(request.Id));
        }

        info.IsDeleted = true;
        info.DeletedAt = DateTime.UtcNow;

        _unitOfWork.Informations.Update(info);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Information with ID: {InformationId} deleted successfully", request.Id);
        return Result.Ok();
    }
}
