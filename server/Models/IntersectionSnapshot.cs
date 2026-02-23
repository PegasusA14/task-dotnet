using System.Collections.Generic;

namespace TrafficSimulation.Api.Models;

public record IntersectionSnapshot(
    IntersectionPhase Phase,
    IReadOnlyList<DirectionalLightState> Lights,
    int SecondsRemaining,
    int TotalPhaseDuration,
    bool IsPreGreen,
    string GeneratedAt
);
