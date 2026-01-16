using Goodreads.Application.Common.Extensions;
using Microsoft.EntityFrameworkCore;

namespace Goodreads.Application.Users.Queries.GetAllUsers;
internal class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, PagedResult<UserDto>>
{
    private readonly UserManager<User> _userManager;
    private readonly IMapper _mapper;

    public GetAllUsersQueryHandler(UserManager<User> userManager, IMapper mapper)
    {
        _userManager = userManager;
        _mapper = mapper;
    }

    public async Task<PagedResult<UserDto>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        var query = _userManager.Users.AsQueryable();

        var p = request.Parameters;

        // Filtering
        if (!string.IsNullOrWhiteSpace(p.Query))
        {
            query = query.Where(u =>
                u.UserName!.Contains(p.Query) ||
                u.FirstName!.Contains(p.Query) ||
                u.LastName!.Contains(p.Query) ||
                u.Email!.Contains(p.Query));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        // Sorting
        query = query.ApplySorting(p.SortColumn, p.SortOrder);

        // Pagination
        query = query.ApplyPaging(p.PageNumber, p.PageSize);

        var users = await query.ToListAsync(cancellationToken);

        var dtoList = _mapper.Map<List<UserDto>>(users);

        // Set role for each user
        foreach (var userDto in dtoList)
        {
            var user = users.FirstOrDefault(u => u.Id == userDto.Id);
            if (user != null)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userDto.Role = roles.FirstOrDefault() ?? "User";
            }
        }

        return PagedResult<UserDto>.Create(dtoList, p.PageNumber, p.PageSize, totalCount);
    }
}

