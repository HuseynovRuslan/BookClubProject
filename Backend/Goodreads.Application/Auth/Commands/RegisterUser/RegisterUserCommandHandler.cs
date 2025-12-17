using System.Net;
using Microsoft.EntityFrameworkCore.Storage;

namespace Goodreads.Application.Auth.Commands.RegisterUser;

internal class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, Result<string>>
{
    private readonly UserManager<User> _userManager;
    private readonly IMapper _mapper;
    private readonly ILogger<RegisterUserCommandHandler> _logger;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;

    public RegisterUserCommandHandler(
        UserManager<User> userManager,
        IMapper mapper,
        ILogger<RegisterUserCommandHandler> logger,
        IEmailService emailService,
        IUnitOfWork unitOfWork)
    {
        _userManager = userManager;
        _mapper = mapper;
        _logger = logger;
        _emailService = emailService;
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

        // Email confirmation token
        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = WebUtility.UrlEncode(token);

        var confirmationLink = $"https://localhost:7050/api/auth/confirm-email?userId={user.Id}&token={encodedToken}";

        // ?? Email gönd?r
        try
        {
            var subject = "BookClub Hesab?n?z? T?sdiql?yin";
            var body = $@"
                <p>Salam {user.UserName},</p>
                <p>Z?hm?t olmasa hesab?n?z? t?sdiql?m?k üçün a?a??dak? link? daxil olun:</p>
                <p><a href='{confirmationLink}'>Hesab? T?sdiql?</a></p>
                <p>?g?r bu siz deyilsinizs?, mesaj? n?z?r? almay?n.</p>
            ";

            await _emailService.SendEmailAsync(user.Email, subject, body);

            _logger.LogInformation("Confirmation email sent to: {Email}", user.Email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send confirmation email to {Email}", user.Email);
            return Result<string>.Fail(Error.Failure("1","Failed to send confirmation email."));
        }

        return Result<string>.Ok("Hesab yarad?ld?, email gönd?rildi.");
    }
}
