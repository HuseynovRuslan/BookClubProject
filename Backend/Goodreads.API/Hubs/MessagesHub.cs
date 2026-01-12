using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Goodreads.API.Hubs;
[Authorize]
public class MessagesHub : Hub
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

            // User online olduğunu bildir
            await Clients.Others.SendAsync("UserOnline", userId);
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
                        // User offline olduğunu bildir
                        _ = Clients.Others.SendAsync("UserOffline", userId);
                    }
                }
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinConversation(string otherUserId)
    {
        var userId = Context.UserIdentifier;
        if (userId != null)
        {
            var groupName = GetConversationGroupName(userId, otherUserId);
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }
    }

    public async Task LeaveConversation(string otherUserId)
    {
        var userId = Context.UserIdentifier;
        if (userId != null)
        {
            var groupName = GetConversationGroupName(userId, otherUserId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }
    }

    private static string GetConversationGroupName(string userId1, string userId2)
    {
        // Consistent group name: always smaller ID first
        return string.Compare(userId1, userId2, StringComparison.Ordinal) < 0
            ? $"conversation_{userId1}_{userId2}"
            : $"conversation_{userId2}_{userId1}";
    }

    public static bool IsUserOnline(string userId)
    {
        lock (UserConnections)
        {
            return UserConnections.ContainsKey(userId) && UserConnections[userId].Count > 0;
        }
    }
}
