using TrafficSimulation.Api.Configuration;
using TrafficSimulation.Api.Models;

namespace TrafficSimulation.Api.StateMachine;

public class IntersectionStateMachine : IIntersectionStateMachine
{
    private readonly struct PhaseEntry
    {
        public IntersectionPhase Phase { get; }
        public int Duration { get; }

        public PhaseEntry(IntersectionPhase phase, int duration)
        {
            Phase = phase;
            Duration = duration;
        }
    }

    private static readonly PhaseEntry[] Phases =
    [
        new(IntersectionPhase.L1_PreGreen, SignalTimingConfig.PreGreenYellowDuration),
        new(IntersectionPhase.L1_Green,    SignalTimingConfig.GreenDuration),
        new(IntersectionPhase.L2_PreGreen, SignalTimingConfig.PreGreenYellowDuration),
        new(IntersectionPhase.L2_Green,    SignalTimingConfig.GreenDuration),
        new(IntersectionPhase.L3_PreGreen, SignalTimingConfig.PreGreenYellowDuration),
        new(IntersectionPhase.L3_Green,    SignalTimingConfig.GreenDuration),
        new(IntersectionPhase.L4_PreGreen, SignalTimingConfig.PreGreenYellowDuration),
        new(IntersectionPhase.L4_Green,    SignalTimingConfig.GreenDuration),
    ];

    private static readonly int PhaseCount = Phases.Length;

    // Signal metadata: [signalIndex] => (Id, LaneName, Position, PreGreenPhaseIndex, GreenPhaseIndex)
    private static readonly (string Id, string LaneName, string Position, int PreGreenIdx, int GreenIdx)[] SignalMeta =
    [
        ("L1", "West→East",   "North", 0, 1),
        ("L2", "North→South", "East",  2, 3),
        ("L3", "East→West",   "South", 4, 5),
        ("L4", "South→North", "West",  6, 7),
    ];

    private int _currentPhaseIndex;
    private int _secondsRemaining;
    private int _cycleElapsedSeconds;
    private readonly object _lock = new();

    public IntersectionStateMachine()
    {
        _currentPhaseIndex = 0; // L1_PreGreen
        _secondsRemaining = Phases[0].Duration; // 3
        _cycleElapsedSeconds = 0;
    }

    public IntersectionSnapshot GetCurrentSnapshot()
    {
        lock (_lock)
        {
            return BuildSnapshot();
        }
    }

    public IntersectionSnapshot Tick()
    {
        lock (_lock)
        {
            _secondsRemaining--;
            _cycleElapsedSeconds++;

            if (_secondsRemaining <= 0)
            {
                _currentPhaseIndex = (_currentPhaseIndex + 1) % PhaseCount;
                _secondsRemaining = Phases[_currentPhaseIndex].Duration;

                if (_currentPhaseIndex == 0)
                {
                    _cycleElapsedSeconds = 0;
                }
            }

            return BuildSnapshot();
        }
    }

    private IntersectionSnapshot BuildSnapshot()
    {
        var currentPhase = Phases[_currentPhaseIndex].Phase;
        var totalDuration = Phases[_currentPhaseIndex].Duration;
        var signals = new SignalState[SignalMeta.Length];

        for (int i = 0; i < SignalMeta.Length; i++)
        {
            var meta = SignalMeta[i];

            var lightState = DeriveLightState(_currentPhaseIndex, meta.PreGreenIdx, meta.GreenIdx);
            var isPreGreen = _currentPhaseIndex == meta.PreGreenIdx;
            var isActive = _currentPhaseIndex == meta.PreGreenIdx || _currentPhaseIndex == meta.GreenIdx;
            var waitingTime = isActive ? 0 : ComputeWaitingTime(meta.PreGreenIdx);
            var phaseSeconds = isActive ? _secondsRemaining : 0;

            signals[i] = new SignalState(
                meta.Id,
                meta.LaneName,
                meta.Position,
                lightState,
                isPreGreen,
                waitingTime,
                phaseSeconds
            );
        }

        return new IntersectionSnapshot(
            currentPhase,
            _secondsRemaining,
            totalDuration,
            _cycleElapsedSeconds,
            DateTime.UtcNow.ToString("o"),
            signals
        );
    }

    private static LightState DeriveLightState(int currentIdx, int preGreenIdx, int greenIdx)
    {
        if (currentIdx == preGreenIdx) return LightState.Yellow;
        if (currentIdx == greenIdx) return LightState.Green;
        return LightState.Red;
    }

    private int ComputeWaitingTime(int targetPreGreenIdx)
    {
        // Sum: secondsRemaining in current phase + full durations of all phases
        // between (current+1) and (targetPreGreenIdx - 1), wrapping circularly.
        int total = _secondsRemaining;

        int idx = (_currentPhaseIndex + 1) % PhaseCount;
        while (idx != targetPreGreenIdx)
        {
            total += Phases[idx].Duration;
            idx = (idx + 1) % PhaseCount;
        }

        return total;
    }
}
