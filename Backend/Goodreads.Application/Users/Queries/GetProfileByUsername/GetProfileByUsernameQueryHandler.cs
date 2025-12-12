using Goodreads.Domain.Constants;

namespace Goodreads.Application.Users.Queries.GetProfileByUsername;
internal class GetProfileByUsernameQueryHandler : IRequestHandler<GetProfileByUsernameQuery, Result<UserProfileDto>>
{
    private readonly ILogger<GetProfileByUsernameQueryHandler> _logger;
    private readonly UserManager<User> _userManager;
    private readonly IMapper _mapper;
    public GetProfileByUsernameQueryHandler(ILogger<GetProfileByUsernameQueryHandler> logger, UserManager<User> userManager, IMapper mapper)
    {
        _logger = logger;
        _userManager = userManager;
        _mapper = mapper;
    }
    public async Task<Result<UserProfileDto>> Handle(GetProfileByUsernameQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting user profile : {Username}", request.Username);

        var user = await _userManager.FindByNameAsync(request.Username);
        if (user == null)
        {
            _logger.LogWarning("User not found: {Username}", request.Username);
            return Result<UserProfileDto>.Fail(UserErrors.NotFound(request.Username));
        }

        var dto = _mapper.Map<UserProfileDto>(user);
        
        // Get user roles
        var roles = await _userManager.GetRolesAsync(user);
        dto.Role = roles.FirstOrDefault() ?? Roles.User;

        return Result<UserProfileDto>.Ok(dto);
    }
}

