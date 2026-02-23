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

    // Only 4 phases — yellow overlaps with the tail of the previous green
    private static readonly PhaseEntry[] Phases =
    [
        new(IntersectionPhase.L1_Green, SignalTimingConfig.GreenDuration),
        new(IntersectionPhase.L2_Green, SignalTimingConfig.GreenDuration),
        new(IntersectionPhase.L3_Green, SignalTimingConfig.GreenDuration),
        new(IntersectionPhase.L4_Green, SignalTimingConfig.GreenDuration),
    ];

    private static readonly int PhaseCount = Phases.Length;

    // Signal metadata: [signalIndex] => (Id, LaneName, Position, GreenPhaseIndex)
    private static readonly (string Id, string LaneName, string Position, int GreenIdx)[] SignalMeta =
    [
        ("L1", "West\u2192East",   "North", 0),
        ("L2", "North\u2192South", "East",  1),
        ("L3", "East\u2192West",   "South", 2),
        ("L4", "South\u2192North", "West",  3),
    ];

    private int _currentPhaseIndex;
    private int _secondsRemaining;
    private int _cycleElapsedSeconds;
    private readonly object _lock = new();

    public IntersectionStateMachine()
    {
        _currentPhaseIndex = 0; // L1_Green
        _secondsRemaining = SignalTimingConfig.GreenDuration; // 45
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

        // Whether we are in the overlap window (last N seconds of current green)
        bool inOverlapWindow = _secondsRemaining <= SignalTimingConfig.PreGreenYellowDuration;

        // The index of the NEXT signal that will go green
        int nextGreenIdx = (_currentPhaseIndex + 1) % PhaseCount;

        for (int i = 0; i < SignalMeta.Length; i++)
        {
            var meta = SignalMeta[i];
            bool isPreGreen = false;
            LightState lightState;
            int phaseSeconds;

            if (meta.GreenIdx == _currentPhaseIndex)
            {
                // This signal IS the current green signal
                // Post-green yellow: show yellow in the last N seconds before turning red
                if (_secondsRemaining <= SignalTimingConfig.PostGreenYellowDuration)
                {
                    lightState = LightState.Yellow;
                }
                else
                {
                    lightState = LightState.Green;
                }
                phaseSeconds = _secondsRemaining;
            }
            else if (inOverlapWindow && meta.GreenIdx == nextGreenIdx)
            {
                // This signal is NEXT and we're in the overlap window:
                // it turns yellow (pre-green) while current green finishes
                lightState = LightState.Yellow;
                isPreGreen = true;
                phaseSeconds = _secondsRemaining; // seconds until this signal goes green
            }
            else
            {
                // All other signals are red
                lightState = LightState.Red;
                phaseSeconds = 0;
            }

            // Compute waiting time
            bool isActive = meta.GreenIdx == _currentPhaseIndex || (inOverlapWindow && meta.GreenIdx == nextGreenIdx);
            int waitingTime = isActive ? 0 : ComputeWaitingTime(meta.GreenIdx);

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

    private int ComputeWaitingTime(int targetGreenIdx)
    {
        // Sum: secondsRemaining in current phase + full durations of all phases
        // between (current+1) and (targetGreenIdx - 1), wrapping circularly
        int total = _secondsRemaining;

        int idx = (_currentPhaseIndex + 1) % PhaseCount;
        while (idx != targetGreenIdx)
        {
            total += Phases[idx].Duration;
            idx = (idx + 1) % PhaseCount;
        }

        return total;
    }
}
