import { useEffect, useRef, useMemo } from "react";
import type { TrafficPhase } from "@/hooks/useTrafficLight";

interface TrafficLightCardProps {
    phase: TrafficPhase;
    secondsRemaining: number;
    totalPhaseDuration: number;
    direction: "N" | "S" | "E" | "W";
    visible: boolean;
}

const PHASE_CONFIG: Record<TrafficPhase, { color: string; glow: string; label: string }> = {
    red: {
        color: "var(--light-red)",
        glow: "var(--glow-red)",
        label: "STOP",
    },
    yellow: {
        color: "var(--light-yellow)",
        glow: "var(--glow-yellow)",
        label: "READY",
    },
    green: {
        color: "var(--light-green)",
        glow: "var(--glow-green)",
        label: "GO",
    },
} as const;

const BULB_ORDER: TrafficPhase[] = ["red", "yellow", "green"];

const DIRECTION_NAMES: Record<string, string> = {
    N: "North",
    S: "South",
    E: "East",
    W: "West",
};

export function TrafficLightCard({
    phase,
    secondsRemaining,
    totalPhaseDuration,
    direction,
    visible,
}: TrafficLightCardProps) {
    const config = PHASE_CONFIG[phase];
    const prevPhaseRef = useRef(phase);
    const pulseRef = useRef<HTMLDivElement>(null);

    // Pulse animation on phase change
    useEffect(() => {
        if (prevPhaseRef.current !== phase && pulseRef.current) {
            const el = pulseRef.current;
            el.classList.remove("bulb-pulse");
            // Force reflow
            void el.offsetWidth;
            el.classList.add("bulb-pulse");
        }
        prevPhaseRef.current = phase;
    }, [phase]);

    // Arc progress calculation
    const progress = secondsRemaining / totalPhaseDuration;
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - progress);

    const timerDisplay = String(secondsRemaining).padStart(2, "0");

    // Memoize the card position styles based on direction
    const positionClass = useMemo(() => {
        switch (direction) {
            case "N":
                return "bottom-full left-1/2 -translate-x-1/2 mb-3";
            case "S":
                return "top-full left-1/2 -translate-x-1/2 mt-3";
            case "E":
                return "left-full top-1/2 -translate-y-1/2 ml-3";
            case "W":
                return "right-full top-1/2 -translate-y-1/2 mr-3";
            default:
                return "";
        }
    }, [direction]);

    return (
        <div
            className={`absolute ${positionClass} z-40 pointer-events-none
                  ${visible ? "card-entering" : "card-exiting"}`}
            style={{ willChange: "transform, opacity" }}
        >
            <div
                className="flex flex-col items-center gap-2 p-4 rounded-xl
                    border border-[var(--border)]
                    bg-[var(--card)]/95 backdrop-blur-xl
                    shadow-2xl min-w-[140px]"
            >
                {/* Direction label */}
                <div
                    className="text-[9px] tracking-[0.25em] uppercase opacity-40 mb-1"
                    style={{ color: "var(--foreground)" }}
                >
                    {DIRECTION_NAMES[direction]}
                </div>

                {/* Traffic light housing */}
                <div
                    className="relative flex flex-col items-center gap-[6px] p-3 px-4 rounded-lg"
                    style={{
                        background:
                            "linear-gradient(180deg, #2a2a2e 0%, #1a1a1e 50%, #111114 100%)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow:
                            "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 12px rgba(0,0,0,0.4)",
                    }}
                >
                    {BULB_ORDER.map((bulbPhase) => {
                        const isActive = bulbPhase === phase;
                        const bulbConfig = PHASE_CONFIG[bulbPhase];

                        return (
                            <div
                                key={bulbPhase}
                                ref={isActive ? pulseRef : undefined}
                                className="relative rounded-full"
                                style={{
                                    width: 24,
                                    height: 24,
                                    background: isActive
                                        ? `radial-gradient(circle at 40% 35%, ${bulbConfig.color}, color-mix(in oklch, ${bulbConfig.color} 70%, black))`
                                        : "radial-gradient(circle at 40% 35%, #3a3a3e, #1a1a1e)",
                                    boxShadow: isActive
                                        ? `0 0 8px 2px ${bulbConfig.glow}, 0 0 20px 4px ${bulbConfig.glow}, inset 0 -2px 4px rgba(0,0,0,0.3)`
                                        : "inset 0 2px 4px rgba(0,0,0,0.5), inset 0 -1px 2px rgba(255,255,255,0.04)",
                                    transition: "box-shadow 0.4s ease, background 0.4s ease",
                                }}
                            />
                        );
                    })}
                </div>

                {/* Mounting pole */}
                <div
                    className="w-[3px] h-4 rounded-full"
                    style={{
                        background:
                            "linear-gradient(180deg, #2a2a2e 0%, #1a1a1e 100%)",
                    }}
                />

                {/* Timer with arc */}
                <div className="relative flex items-center justify-center mt-1">
                    <svg
                        width={68}
                        height={68}
                        className="absolute"
                        style={{ transform: "rotate(-90deg)" }}
                    >
                        {/* Background track */}
                        <circle
                            cx={34}
                            cy={34}
                            r={radius}
                            fill="none"
                            stroke="var(--border)"
                            strokeWidth={2.5}
                            opacity={0.3}
                        />
                        {/* Progress arc */}
                        <circle
                            cx={34}
                            cy={34}
                            r={radius}
                            fill="none"
                            stroke={config.color}
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            style={{
                                transition:
                                    "stroke-dashoffset 0.3s linear, stroke 0.4s ease",
                                filter: `drop-shadow(0 0 3px ${config.glow})`,
                            }}
                        />
                    </svg>
                    <span
                        className="text-2xl font-semibold tabular-nums"
                        style={{
                            color: config.color,
                            textShadow: `0 0 12px ${config.glow}`,
                        }}
                    >
                        {timerDisplay}
                    </span>
                </div>

                {/* Phase label */}
                <div
                    className="text-[10px] tracking-[0.3em] uppercase font-medium opacity-60"
                    style={{ color: config.color }}
                >
                    {config.label}
                </div>
            </div>
        </div>
    );
}
