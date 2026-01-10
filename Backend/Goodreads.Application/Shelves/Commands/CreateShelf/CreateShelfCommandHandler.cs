using AutoMapper;
using Goodreads.Application.DTOs;

namespace Goodreads.Application.Shelves.Commands.CreateShelf;
internal class CreateShelfCommandHandler : IRequestHandler<CreateShelfCommand, Result<ShelfDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<User> _userManager;
    private readonly IUserContext _userContext;
    private readonly ILogger<CreateShelfCommandHandler> _logger;
    private readonly IMapper _mapper;

    public CreateShelfCommandHandler(IUnitOfWork unitOfWork, ILogger<CreateShelfCommandHandler> logger, UserManager<User> userManager, IUserContext userContext, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _userManager = userManager;
        _userContext = userContext;
        _mapper = mapper;
    }
    public async Task<Result<ShelfDto>> Handle(CreateShelfCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating new shelf with name: {ShelfName}", request.Name);

        var userId = _userContext.UserId;
        if (userId == null)
            return Result<ShelfDto>.Fail(AuthErrors.Unauthorized);

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            _logger.LogWarning("User not found: {UserId}", userId);
            return Result<ShelfDto>.Fail(UserErrors.NotFound(userId));
        }

        var shelf = new Shelf { UserId = userId, Name = request.Name.Trim() };

        await _unitOfWork.Shelves.AddAsync(shelf);
        await _unitOfWork.SaveChangesAsync();

        var shelfDto = _mapper.Map<ShelfDto>(shelf);
        return Result<ShelfDto>.Ok(shelfDto);
    }
}

