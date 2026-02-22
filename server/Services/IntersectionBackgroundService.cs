using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TrafficSimulation.Api.Hubs;
using TrafficSimulation.Api.StateMachine;

namespace TrafficSimulation.Api.Services;

public class IntersectionBackgroundService : BackgroundService
{
    private readonly IIntersectionStateMachine _stateMachine;
    private readonly IHubContext<TrafficHub, ITrafficClient> _hubContext;
    private readonly ILogger<IntersectionBackgroundService> _logger;

    public IntersectionBackgroundService(
        IIntersectionStateMachine stateMachine,
        IHubContext<TrafficHub, ITrafficClient> hubContext,
        ILogger<IntersectionBackgroundService> logger)
    {
        _stateMachine = stateMachine;
        _hubContext = hubContext;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Traffic Simulation Background Service is starting.");

        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(1));

        try
        {
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                try
                {
                    var snapshot = _stateMachine.Tick();
                    await _hubContext.Clients.All.ReceiveIntersectionState(snapshot);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred during the traffic simulation tick.");
                }
            }
        }
        catch (OperationCanceledException)
        {
            // Expected if WaitForNextTickAsync is canceled
        }
        finally
        {
            _logger.LogInformation("Traffic Simulation Background Service is stopping.");
        }
    }
}
