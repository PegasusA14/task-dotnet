export type LightState = "Red" | "Yellow" | "Green";

export type IntersectionPhase = "NS_Green" | "EW_PreGreen" | "EW_Green" | "NS_PreGreen";

export interface DirectionalLightState {
    direction: string;
    state: LightState;
}

export interface IntersectionSnapshot {
    phase: IntersectionPhase;
    lights: DirectionalLightState[];
    secondsRemaining: number;
    totalPhaseDuration: number;
    isPreGreen: boolean;
    generatedAt: string;
}
