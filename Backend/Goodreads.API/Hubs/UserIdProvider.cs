using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Goodreads.API.Hubs;
public class UserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        // JWT token-dən user ID-ni götürürük
        // JWT-də Sub claim-i user ID-dir
        return connection.User?.FindFirstValue(ClaimTypes.NameIdentifier) 
            ?? connection.User?.FindFirstValue("sub");
    }
}
