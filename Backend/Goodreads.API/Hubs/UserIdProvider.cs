using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Goodreads.API.Hubs;
public class UserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
       
        return connection.User?.FindFirstValue(ClaimTypes.NameIdentifier) 
            ?? connection.User?.FindFirstValue("sub");
    }
}
