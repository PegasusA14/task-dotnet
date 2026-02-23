import { useContext } from "react";
import type { DirectionalLightState } from "../types/TrafficTypes";
import { TrafficContext } from "./useIntersection";

export type TrafficPhase = "red" | "green" | "yellow";

export interface TrafficLightState {
    phase: TrafficPhase;
    secondsRemaining: number;
    totalPhaseDuration: number;
    isPreGreen: boolean;
}

export function useTrafficLight(
    offsetSeconds: number,
    directionSnapshot?: DirectionalLightState,
    serverSecondsRemaining?: number,
    serverTotalPhaseDuration?: number,
    serverIsPreGreen?: boolean
): TrafficLightState {
    const context = useContext(TrafficContext);

    let activeDirectionSnapshot = directionSnapshot;
    let activeSeconds = serverSecondsRemaining;
    let activeTotal = serverTotalPhaseDuration;
    let activeIsPreGreen = serverIsPreGreen;

    if (context && !directionSnapshot) {
        let dir: "north" | "south" | "east" | "west" | null = null;
        if (offsetSeconds === 0) dir = "north";
        else if (offsetSeconds === 5) dir = "east";
        else if (offsetSeconds === 10) dir = "south";
        else if (offsetSeconds === 15) dir = "west";

        if (dir && context[dir]) {
            activeDirectionSnapshot = {
                direction: dir,
                state: context[dir]!.state
            };
            activeSeconds = context[dir]!.secondsRemaining;
            activeTotal = context[dir]!.totalPhaseDuration;
            activeIsPreGreen = context[dir]!.isPreGreen;
        }
    }

    if (
        activeDirectionSnapshot !== undefined &&
        activeSeconds !== undefined &&
        activeTotal !== undefined &&
        activeIsPreGreen !== undefined
    ) {
        return {
            phase: activeDirectionSnapshot.state.toLowerCase() as TrafficPhase,
            secondsRemaining: activeSeconds,
            totalPhaseDuration: activeTotal,
            isPreGreen: activeIsPreGreen,
        };
    }

    // When the server is offline or disconnected, return a blank offline state
    return {
        phase: "red",
        secondsRemaining: 0,
        totalPhaseDuration: 0,
        isPreGreen: false,
    };
}
