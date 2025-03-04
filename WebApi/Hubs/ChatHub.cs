using Microsoft.AspNetCore.SignalR;

namespace WebApi.Hubs
{
    public class ChatHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }

        public async Task StreamMessage(string message)
        {
            await Clients.Caller.SendAsync("ReceiveStreamMessage", message);
        }

        public async Task StartStreaming(string connectionId)
        {
            await Groups.AddToGroupAsync(connectionId, connectionId);
        }

        public async Task StopStreaming(string connectionId)
        {
            await Groups.RemoveFromGroupAsync(connectionId, connectionId);
        }
    }
} 