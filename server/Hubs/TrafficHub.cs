using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using TrafficSimulation.Api.StateMachine;

namespace TrafficSimulation.Api.Hubs;

public class TrafficHub : Hub<ITrafficClient>
{
    private readonly IIntersectionStateMachine _stateMachine;
    private readonly ILogger<TrafficHub> _logger;

    public TrafficHub(IIntersectionStateMachine stateMachine, ILogger<TrafficHub> logger)
    {
        _stateMachine = stateMachine;
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();

        var snapshot = _stateMachine.GetCurrentSnapshot();
        await Clients.Caller.ReceiveIntersectionState(snapshot);

        _logger.LogInformation("Client {ConnectionId} connected.", Context.ConnectionId);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);

        _logger.LogInformation("Client {ConnectionId} disconnected.", Context.ConnectionId);

        if (exception != null)
        {
            _logger.LogWarning(exception, "Client {ConnectionId} disconnected with an error.", Context.ConnectionId);
        }
    }
}
