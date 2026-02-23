import { createContext } from "react";
import { useSignalRConnection, type ConnectionStatus } from "./useSignalRConnection";
import type { LightState, SignalState, IntersectionPhase } from "../types/TrafficTypes";

export interface SignalData {
    id: string;
    laneName: string;
    position: string;
    lightState: LightState;
    isPreGreen: boolean;
    waitingTimeSeconds: number;
    phaseSecondsRemaining: number;
}

export interface IntersectionData {
    /** Signal by pod position: L1=North, L2=East, L3=South, L4=West */
    north: SignalData | undefined;
    east: SignalData | undefined;
    south: SignalData | undefined;
    west: SignalData | undefined;
    /** Current phase enum string */
    phase: IntersectionPhase | null;
    /** Top-level phase seconds remaining */
    phaseSecondsRemaining: number;
    totalPhaseDuration: number;
    cyclePositionSeconds: number;
    connectionStatus: ConnectionStatus;
}

export const TrafficContext = createContext<IntersectionData | null>(null);

export function useIntersection(): IntersectionData {
    const { snapshot, connectionStatus } = useSignalRConnection();

    const getByPosition = (pos: string): SignalData | undefined => {
        if (!snapshot) return undefined;
        const signal = snapshot.signals.find((s: SignalState) => s.position === pos);
        if (!signal) return undefined;

        return {
            id: signal.id,
            laneName: signal.laneName,
            position: signal.position,
            lightState: signal.lightState,
            isPreGreen: signal.isPreGreen,
            waitingTimeSeconds: signal.waitingTimeSeconds,
            phaseSecondsRemaining: signal.phaseSecondsRemaining,
        };
    };

    return {
        north: getByPosition("North"),
        east: getByPosition("East"),
        south: getByPosition("South"),
        west: getByPosition("West"),
        phase: snapshot ? snapshot.currentPhase : null,
        phaseSecondsRemaining: snapshot ? snapshot.phaseSecondsRemaining : 0,
        totalPhaseDuration: snapshot ? snapshot.totalPhaseDuration : 0,
        cyclePositionSeconds: snapshot ? snapshot.cyclePositionSeconds : 0,
        connectionStatus,
    };
}
