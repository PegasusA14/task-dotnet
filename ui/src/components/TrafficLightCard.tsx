import { useMemo } from "react";
import type { TrafficPhase } from "@/hooks/useTrafficLight";
import type { IntersectionPhase } from "@/types/TrafficTypes";
import { useIntersection } from "@/hooks/useIntersection";

interface TrafficLightCardProps {
    phase: TrafficPhase;
    secondsRemaining: number;
    totalPhaseDuration: number;
    direction: "N" | "S" | "E" | "W";
    visible: boolean;
    isPreGreen: boolean;
}

const HumanPhaseNames: Record<IntersectionPhase, string> = {
    NS_Green: "North-South Flowing",
    EW_PreGreen: "East-West Preparing",
    EW_Green: "East-West Flowing",
    NS_PreGreen: "North-South Preparing",
};

const DIRECTION_NAMES: Record<string, string> = {
    N: "North",
    S: "South",
    E: "East",
    W: "West",
};

const PHASE_COLORS: Record<TrafficPhase, string> = {
    red: "var(--light-red)",
    yellow: "var(--light-yellow)",
    green: "var(--light-green)",
};

export function TrafficLightCard({
    phase,
    secondsRemaining,
    totalPhaseDuration,
    direction,
    visible,
    isPreGreen,
}: TrafficLightCardProps) {
    const context = useIntersection();
    const serverPhase = context?.phase || "NS_Green";

    // Position cards into their respective LANES (not overlapping center)
    const positionClass = useMemo(() => {
        switch (direction) {
            case "N": return "bottom-full left-1/2 -translate-x-1/2 mb-3";
            case "S": return "top-full left-1/2 -translate-x-1/2 mt-3";
            case "E": return "left-full top-1/2 -translate-y-1/2 ml-3";
            case "W": return "right-full top-1/2 -translate-y-1/2 mr-3";
            default: return "";
        }
    }, [direction]);

    // Calculate time until green
    let timeUntilGreen = 0;
    if (phase === "red") {
        timeUntilGreen = secondsRemaining;
        if ((direction === "N" || direction === "S") && serverPhase === "EW_Green") {
            timeUntilGreen += 3;
        } else if ((direction === "N" || direction === "S") && serverPhase === "EW_PreGreen") {
            timeUntilGreen += 45 + 3;
        } else if ((direction === "E" || direction === "W") && serverPhase === "NS_Green") {
            timeUntilGreen += 3;
        } else if ((direction === "E" || direction === "W") && serverPhase === "NS_PreGreen") {
            timeUntilGreen += 45 + 3;
        }
    }

    const phaseColor = PHASE_COLORS[phase];
    let statusLabel = "";
    if (phase === "red") statusLabel = "STOP";
    if (phase === "yellow") statusLabel = isPreGreen ? "READY" : "CAUTION";
    if (phase === "green") statusLabel = "GO";

    // Progress for timer arc
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const progress = totalPhaseDuration > 0 ? secondsRemaining / totalPhaseDuration : 0;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div
            className={`absolute ${positionClass} z-50 pointer-events-none transition-all duration-300
                  ${visible ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}`}
            style={{ width: "180px" }}
        >
            <div className="flex flex-col gap-3 p-4 rounded-xl border border-[var(--border)] bg-white dark:bg-stone-900 shadow-2xl text-left">
                {/* Direction + Phase */}
                <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-[0.2em] uppercase opacity-60 font-semibold">
                        {DIRECTION_NAMES[direction]}
                    </span>
                    <span
                        className="text-[10px] tracking-[0.15em] uppercase font-bold px-2 py-0.5 rounded-full"
                        style={{
                            color: phaseColor,
                            backgroundColor: `color-mix(in oklch, ${phaseColor} 15%, transparent)`,
                        }}
                    >
                        {statusLabel}
                    </span>
                </div>

                {/* Timer Circle + Countdown */}
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center shrink-0" style={{ width: 48, height: 48 }}>
                        <svg width="48" height="48" className="absolute -rotate-90">
                            <circle cx="24" cy="24" r={radius} fill="none" stroke="currentColor" strokeWidth="3" className="opacity-10" style={{ color: phaseColor }} />
                            <circle
                                cx="24" cy="24" r={radius} fill="none" stroke="currentColor" strokeWidth="3"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                style={{ color: phaseColor, transition: "stroke-dashoffset 0.5s linear" }}
                            />
                        </svg>
                        <span className="font-mono font-bold text-lg z-10" style={{ color: phaseColor }}>
                            {String(secondsRemaining).padStart(2, "0")}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-foreground leading-tight">
                            {HumanPhaseNames[serverPhase] || "Unknown"}
                        </span>
                        <span className="text-[10px] opacity-60">
                            {phase === "yellow"
                                ? (isPreGreen ? "Prepare to go" : "Caution")
                                : phase === "red"
                                    ? "Waiting for green"
                                    : "Traffic flowing"}
                        </span>
                    </div>
                </div>

                {/* Time until green */}
                {phase === "red" && (
                    <>
                        <div className="w-full h-px bg-[var(--border)]" />
                        <div className="flex justify-between items-center text-xs">
                            <span className="opacity-60">Green in</span>
                            <span className="font-mono font-bold" style={{ color: "var(--light-green)" }}>
                                {timeUntilGreen}s
                            </span>
                        </div>
                    </>
                )}

                {/* Phase duration bar */}
                <div className="w-full h-1 rounded-full overflow-hidden bg-[var(--border)]">
                    <div
                        className="h-full rounded-full transition-all duration-500 ease-linear"
                        style={{
                            width: `${progress * 100}%`,
                            backgroundColor: phaseColor,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
