import { useState, useEffect, useRef } from "react";

export type TrafficPhase = "red" | "green" | "yellow";

interface PhaseConfig {
    phase: TrafficPhase;
    duration: number;
}

const CYCLE: PhaseConfig[] = [
    { phase: "red", duration: 8 },
    { phase: "green", duration: 8 },
    { phase: "yellow", duration: 3 },
];

const TOTAL_CYCLE = CYCLE.reduce((sum, p) => sum + p.duration, 0); // 19s

function getPhaseAtTime(elapsed: number): {
    phase: TrafficPhase;
    secondsRemaining: number;
    totalPhaseDuration: number;
} {
    const position = ((elapsed % TOTAL_CYCLE) + TOTAL_CYCLE) % TOTAL_CYCLE;
    let accumulated = 0;

    for (const config of CYCLE) {
        if (position < accumulated + config.duration) {
            return {
                phase: config.phase,
                secondsRemaining: Math.ceil(accumulated + config.duration - position),
                totalPhaseDuration: config.duration,
            };
        }
        accumulated += config.duration;
    }

    // Fallback (shouldn't reach)
    return { phase: "red", secondsRemaining: 8, totalPhaseDuration: 8 };
}

export interface TrafficLightState {
    phase: TrafficPhase;
    secondsRemaining: number;
    totalPhaseDuration: number;
}

export function useTrafficLight(offsetSeconds: number): TrafficLightState {
    const startTimeRef = useRef(Date.now());
    const [state, setState] = useState<TrafficLightState>(() =>
        getPhaseAtTime(offsetSeconds)
    );

    useEffect(() => {
        startTimeRef.current = Date.now();

        const tick = () => {
            const elapsedMs = Date.now() - startTimeRef.current;
            const elapsedSeconds = Math.floor(elapsedMs / 1000);
            setState(getPhaseAtTime(elapsedSeconds + offsetSeconds));
        };

        tick(); // Initial
        const interval = setInterval(tick, 200); // Tick faster than 1s for smooth countdown

        return () => clearInterval(interval);
    }, [offsetSeconds]);

    return state;
}
