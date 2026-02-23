import { useContext, useMemo } from "react";
import type { TrafficPhase } from "@/hooks/useTrafficLight";
import type { IntersectionPhase } from "@/types/TrafficTypes";
import { TrafficContext } from "@/hooks/useIntersection";

interface TrafficLightCardProps {
    phase: TrafficPhase;
    secondsRemaining: number;
    totalPhaseDuration: number;
    direction: "N" | "S" | "E" | "W";
    visible: boolean;
    isPreGreen: boolean;
    waitingTimeSeconds: number;
    signalId: string;
    laneName: string;
}

const HumanPhaseNames: Record<IntersectionPhase, string> = {
    L1_Green: "L1 Flowing (West→East)",
    L2_Green: "L2 Flowing (North→South)",
    L3_Green: "L3 Flowing (East→West)",
    L4_Green: "L4 Flowing (South→North)",
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
    waitingTimeSeconds,
    signalId,
    laneName,
}: TrafficLightCardProps) {
    const context = useContext(TrafficContext);
    const serverPhase = context?.phase || "L1_Green";

    const positionClass = useMemo(() => {
        switch (direction) {
            case "N": return "bottom-full left-1/2 -translate-x-1/2 mb-3";
            case "S": return "top-full left-1/2 -translate-x-1/2 mt-3";
            case "E": return "left-full top-1/2 -translate-y-1/2 ml-3";
            case "W": return "right-full top-1/2 -translate-y-1/2 mr-3";
            default: return "";
        }
    }, [direction]);

    const phaseColor = PHASE_COLORS[phase];
    let statusLabel = "";
    if (phase === "red") statusLabel = "STOP";
    if (phase === "yellow") statusLabel = isPreGreen ? "READY" : "CAUTION";
    if (phase === "green") statusLabel = "GO";

    // Progress for timer arc
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const displaySeconds = phase === "red" ? waitingTimeSeconds : secondsRemaining;
    const displayTotal = phase === "red" ? Math.max(waitingTimeSeconds, 1) : totalPhaseDuration;
    const progress = displayTotal > 0 ? displaySeconds / displayTotal : 0;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div
            className={`absolute ${positionClass} z-50 pointer-events-none transition-all duration-300
                  ${visible ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}`}
            style={{ width: "200px" }}
        >
            <div className="flex flex-col gap-3 p-4 rounded-xl border border-[var(--border)] bg-white dark:bg-stone-900 shadow-2xl text-left">
                {/* Signal ID + Lane + Status */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold tracking-wide text-foreground">
                            {signalId}
                        </span>
                        <span className="text-[9px] tracking-[0.1em] uppercase opacity-50">
                            {laneName}
                        </span>
                    </div>
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

                {/* Timer Circle + Phase Info */}
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
                            {String(displaySeconds).padStart(2, "0")}
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

                {/* Waiting time from server */}
                {phase === "red" && waitingTimeSeconds > 0 && (
                    <>
                        <div className="w-full h-px bg-[var(--border)]" />
                        <div className="flex justify-between items-center text-xs">
                            <span className="opacity-60">Green in</span>
                            <span className="font-mono font-bold" style={{ color: "var(--light-green)" }}>
                                {waitingTimeSeconds}s
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
