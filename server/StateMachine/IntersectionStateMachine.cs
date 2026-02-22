using System;
using System.Collections.Generic;
using TrafficSimulation.Api.Configuration;
using TrafficSimulation.Api.Models;

namespace TrafficSimulation.Api.StateMachine;

public class IntersectionStateMachine : IIntersectionStateMachine
{
    private readonly Dictionary<IntersectionPhase, int> _phaseDurations;
    private IntersectionPhase _currentPhase;
    private int _secondsRemaining;
    private readonly object _lock = new();

    public IntersectionStateMachine()
    {
        _phaseDurations = new Dictionary<IntersectionPhase, int>
        {
            { IntersectionPhase.NS_Green, SignalTimingConfig.NS_GreenDuration },
            { IntersectionPhase.NS_Yellow, SignalTimingConfig.NS_YellowDuration },
            { IntersectionPhase.EW_Green, SignalTimingConfig.EW_GreenDuration },
            { IntersectionPhase.EW_Yellow, SignalTimingConfig.EW_YellowDuration }
        };

        _currentPhase = IntersectionPhase.NS_Green;
        _secondsRemaining = SignalTimingConfig.NS_GreenDuration;
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

            if (_secondsRemaining <= 0)
            {
                TransitionToNextPhase();
            }

            return BuildSnapshot();
        }
    }

    private void TransitionToNextPhase()
    {
        _currentPhase = _currentPhase switch
        {
            IntersectionPhase.NS_Green => IntersectionPhase.NS_Yellow,
            IntersectionPhase.NS_Yellow => IntersectionPhase.EW_Green,
            IntersectionPhase.EW_Green => IntersectionPhase.EW_Yellow,
            IntersectionPhase.EW_Yellow => IntersectionPhase.NS_Green,
            _ => IntersectionPhase.NS_Green
        };

        _secondsRemaining = _phaseDurations[_currentPhase];
    }

    private IntersectionSnapshot BuildSnapshot()
    {
        var lights = DeriveAllLightStates(_currentPhase);
        var totalDuration = _phaseDurations[_currentPhase];
        var generatedAt = DateTime.UtcNow.ToString("o");

        return new IntersectionSnapshot(
            _currentPhase,
            lights,
            _secondsRemaining,
            totalDuration,
            generatedAt
        );
    }

    private IReadOnlyList<DirectionalLightState> DeriveAllLightStates(IntersectionPhase phase)
    {
        return phase switch
        {
            IntersectionPhase.NS_Green => new[]
            {
                new DirectionalLightState("North", LightState.Green),
                new DirectionalLightState("South", LightState.Green),
                new DirectionalLightState("East", LightState.Red),
                new DirectionalLightState("West", LightState.Red)
            },
            IntersectionPhase.NS_Yellow => new[]
            {
                new DirectionalLightState("North", LightState.Yellow),
                new DirectionalLightState("South", LightState.Yellow),
                new DirectionalLightState("East", LightState.Red),
                new DirectionalLightState("West", LightState.Red)
            },
            IntersectionPhase.EW_Green => new[]
            {
                new DirectionalLightState("North", LightState.Red),
                new DirectionalLightState("South", LightState.Red),
                new DirectionalLightState("East", LightState.Green),
                new DirectionalLightState("West", LightState.Green)
            },
            IntersectionPhase.EW_Yellow => new[]
            {
                new DirectionalLightState("North", LightState.Red),
                new DirectionalLightState("South", LightState.Red),
                new DirectionalLightState("East", LightState.Yellow),
                new DirectionalLightState("West", LightState.Yellow)
            },
            _ => Array.Empty<DirectionalLightState>()
        };
    }
}
