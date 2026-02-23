export type LightState = "Red" | "Yellow" | "Green";

export type IntersectionPhase =
    | "L1_Green"
    | "L2_Green"
    | "L3_Green"
    | "L4_Green";

export interface SignalState {
    id: string;
    laneName: string;
    position: string;
    lightState: LightState;
    isPreGreen: boolean;
    waitingTimeSeconds: number;
    phaseSecondsRemaining: number;
}

export interface IntersectionSnapshot {
    currentPhase: IntersectionPhase;
    phaseSecondsRemaining: number;
    totalPhaseDuration: number;
    cyclePositionSeconds: number;
    generatedAt: string;
    signals: SignalState[];
}
