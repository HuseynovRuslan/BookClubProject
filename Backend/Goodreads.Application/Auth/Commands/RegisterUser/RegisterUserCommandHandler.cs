using Microsoft.EntityFrameworkCore.Storage;

namespace Goodreads.Application.Auth.Commands.RegisterUser;

internal class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, Result<string>>
{
    private readonly UserManager<User> _userManager;
    private readonly IMapper _mapper;
    private readonly ILogger<RegisterUserCommandHandler> _logger;
    private readonly IUnitOfWork _unitOfWork;

    public RegisterUserCommandHandler(
        UserManager<User> userManager,
        IMapper mapper,
        ILogger<RegisterUserCommandHandler> logger,
        IUnitOfWork unitOfWork)
    {
        _userManager = userManager;
        _mapper = mapper;
        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<string>> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling RegisterUserCommand for user: {UserName}", request.UserName);

        if (await _userManager.FindByNameAsync(request.UserName) != null)
            return Result<string>.Fail(UserErrors.UsernameTaken);

        if (await _userManager.FindByEmailAsync(request.Email) != null)
            return Result<string>.Fail(UserErrors.EmailAlreadyRegistered);

        var user = _mapper.Map<User>(request);
        user.Social = new Social(); // Initialize Social to prevent duplicate key error
        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
            return Result<string>.Fail(UserErrors.CreateUserFailed(result.Errors.First().Description));

        await _userManager.AddToRoleAsync(user, Roles.User);

        var defaultShelfs = DefaultShelves.All.Select(shelf => new Shelf
        {
            Name = shelf,
            UserId = user.Id,
            IsDefault = true
        }).ToList();
        await _unitOfWork.Shelves.AddRangeAsync(defaultShelfs);
        await _unitOfWork.SaveChangesAsync();

        // Email confirmation will be sent manually by user request from the app
        // No automatic email sending during registration
        
        return Result<string>.Ok("Account created successfully! You can verify your email from your profile settings.");
    }
}
