namespace TrafficSimulation.Api.Models;

public record SignalState(
    string Id,
    string LaneName,
    string Position,
    LightState LightState,
    bool IsPreGreen,
    int WaitingTimeSeconds,
    int PhaseSecondsRemaining
);
