using Goodreads.Domain.Constants;

namespace Goodreads.Application.Users.Queries.GetProfileById;
internal class GetProfileByIdQueryHandler : IRequestHandler<GetProfileByIdQuery, Result<UserProfileDto>>
{
    private readonly ILogger<GetProfileByIdQueryHandler> _logger;
    private readonly UserManager<User> _userManager;
    private readonly IMapper _mapper;

    public GetProfileByIdQueryHandler(
        ILogger<GetProfileByIdQueryHandler> logger,
        UserManager<User> userManager,
        IMapper mapper)
    {
        _logger = logger;
        _userManager = userManager;
        _mapper = mapper;
    }

    public async Task<Result<UserProfileDto>> Handle(GetProfileByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting user profile by ID: {UserId}", request.UserId);

        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user == null)
        {
            _logger.LogWarning("User not found: {UserId}", request.UserId);
            return Result<UserProfileDto>.Fail(UserErrors.NotFound(request.UserId));
        }

        var dto = _mapper.Map<UserProfileDto>(user);
        
        // Get user roles
        var roles = await _userManager.GetRolesAsync(user);
        dto.Role = roles.FirstOrDefault() ?? Roles.User;

        return Result<UserProfileDto>.Ok(dto);
    }
}
