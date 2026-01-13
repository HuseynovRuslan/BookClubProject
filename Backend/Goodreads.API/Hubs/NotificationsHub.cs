using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Goodreads.API.Hubs;

[Authorize]
public class NotificationsHub : Hub
{
    private static readonly Dictionary<string, HashSet<string>> UserConnections = new();

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        if (userId != null)
        {
            lock (UserConnections)
            {
                if (!UserConnections.ContainsKey(userId))
                {
                    UserConnections[userId] = new HashSet<string>();
                }
                UserConnections[userId].Add(Context.ConnectionId);
            }
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;
        if (userId != null)
        {
            lock (UserConnections)
            {
                if (UserConnections.ContainsKey(userId))
                {
                    UserConnections[userId].Remove(Context.ConnectionId);
                    if (UserConnections[userId].Count == 0)
                    {
                        UserConnections.Remove(userId);
                    }
                }
            }
        }
        await base.OnDisconnectedAsync(exception);
    }

    public static bool IsUserOnline(string userId)
    {
        lock (UserConnections)
        {
            return UserConnections.ContainsKey(userId) && UserConnections[userId].Count > 0;
        }
    }
}
