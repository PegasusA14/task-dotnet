import { useContext } from "react";
import { TrafficContext, type SignalData } from "./useIntersection";

export type TrafficPhase = "red" | "green" | "yellow";

export interface TrafficLightState {
    phase: TrafficPhase;
    secondsRemaining: number;
    totalPhaseDuration: number;
    isPreGreen: boolean;
    waitingTimeSeconds: number;
    signalId: string;
    laneName: string;
}

const DIR_MAP = {
    N: "north",
    E: "east",
    S: "south",
    W: "west",
} as const;

export function useTrafficLight(direction: "N" | "E" | "S" | "W"): TrafficLightState {
    const context = useContext(TrafficContext);

    const key = DIR_MAP[direction];
    const signal: SignalData | undefined = context ? context[key] : undefined;

    if (signal) {
        return {
            phase: signal.lightState.toLowerCase() as TrafficPhase,
            secondsRemaining: signal.phaseSecondsRemaining,
            totalPhaseDuration: context!.totalPhaseDuration,
            isPreGreen: signal.isPreGreen,
            waitingTimeSeconds: signal.waitingTimeSeconds,
            signalId: signal.id,
            laneName: signal.laneName,
        };
    }

    return {
        phase: "red",
        secondsRemaining: 0,
        totalPhaseDuration: 0,
        isPreGreen: false,
        waitingTimeSeconds: 0,
        signalId: "",
        laneName: "",
    };
}
