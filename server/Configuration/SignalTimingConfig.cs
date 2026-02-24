namespace TrafficSimulation.Api.Configuration;

public static class SignalTimingConfig
{
    public const int GreenDuration = 45;
    public const int PreGreenYellowDuration = 5;
    public const int PostGreenYellowDuration = 5;
    public const int TotalSignalCount = 4;
    public const int FullCycleDuration = GreenDuration * TotalSignalCount; // 180
}
