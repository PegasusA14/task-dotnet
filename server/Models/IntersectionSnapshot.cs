namespace TrafficSimulation.Api.Models;

public record IntersectionSnapshot(
    IntersectionPhase CurrentPhase,
    int PhaseSecondsRemaining,
    int TotalPhaseDuration,
    int CyclePositionSeconds,
    string GeneratedAt,
    IReadOnlyList<SignalState> Signals
);
