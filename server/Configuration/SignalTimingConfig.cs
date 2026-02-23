namespace TrafficSimulation.Api.Configuration;

public static class SignalTimingConfig
{
    public const int GreenDuration = 45;
    public const int PreGreenYellowDuration = 3;
    public const int TotalSignalCount = 4;
    public const int PhaseBlockDuration = GreenDuration + PreGreenYellowDuration; // 48
    public const int FullCycleDuration = PhaseBlockDuration * TotalSignalCount; // 192
}
