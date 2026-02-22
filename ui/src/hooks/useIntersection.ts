import { createContext } from "react";
import { useSignalRConnection } from "./useSignalRConnection";
import type { LightState } from "../types/TrafficTypes";

export const TrafficContext = createContext<ReturnType<typeof useIntersection> | null>(null);

export interface DirectionalState {
    state: LightState;
    secondsRemaining: number;
    totalPhaseDuration: number;
}

export function useIntersection() {
    const { snapshot, connectionStatus } = useSignalRConnection();

    const getDirection = (dirName: string): DirectionalState | undefined => {
        if (!snapshot) return undefined;
        const light = snapshot.lights.find(l => l.direction === dirName);
        if (!light) return undefined;

        return {
            state: light.state,
            secondsRemaining: snapshot.secondsRemaining,
            totalPhaseDuration: snapshot.totalPhaseDuration
        };
    };

    return {
        north: getDirection("North"),
        south: getDirection("South"),
        east: getDirection("East"),
        west: getDirection("West"),
        phase: snapshot ? snapshot.phase : null,
        connectionStatus
    };
}
