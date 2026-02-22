export type LightState = "Red" | "Yellow" | "Green";

export type IntersectionPhase = "NS_Green" | "NS_Yellow" | "EW_Green" | "EW_Yellow";

export interface DirectionalLightState {
    direction: string;
    state: LightState;
}

export interface IntersectionSnapshot {
    phase: IntersectionPhase;
    lights: DirectionalLightState[];
    secondsRemaining: number;
    totalPhaseDuration: number;
    generatedAt: string;
}
