import { useMemo } from "react";
import type { TrafficPhase } from "@/hooks/useTrafficLight";

interface TrafficLightCardProps {
    phase: TrafficPhase;
    secondsRemaining: number;
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

const DIRECTION_NAMES: Record<string, string> = {
    N: "North",
    S: "South",
    E: "East",
    W: "West",
};

export function TrafficLightCard({
    phase,
    secondsRemaining,
    direction,
    visible,
}: TrafficLightCardProps) {
    const config = PHASE_CONFIG[phase];

    const timerDisplay = String(secondsRemaining).padStart(2, "0");

    // Memoize the card position styles based on direction
    const positionClass = useMemo(() => {
        switch (direction) {
            case "N":
                return "bottom-full left-1/2 -translate-x-1/2 mb-2";
            case "S":
                return "top-full left-1/2 -translate-x-1/2 mt-2";
            case "E":
                return "left-full top-1/2 -translate-y-1/2 ml-2";
            case "W":
                return "right-full top-1/2 -translate-y-1/2 mr-2";
            default:
                return "";
        }
    }, [direction]);

    return (
        <div
            className={`absolute ${positionClass} z-50 pointer-events-none
                  ${visible ? "card-entering" : "card-exiting"}`}
            style={{ willChange: "transform, opacity" }}
        >
            <div
                className="flex flex-col items-center gap-2 p-3 px-4 rounded-xl
                    border border-[var(--border)]
                    bg-[var(--card)]/95 backdrop-blur-xl
                    shadow-2xl min-w-[120px]"
            >
                {/* Direction label */}
                <div
                    className="text-[9px] tracking-[0.25em] uppercase opacity-60 mb-1 font-bold"
                    style={{ color: "var(--foreground)" }}
                >
                    {DIRECTION_NAMES[direction]}
                </div>

                {/* Traffic light housing */}
                <div
                    className="relative flex flex-col items-center gap-[4px] p-2 px-3 rounded-lg"
                    style={{
                        background:
                            "linear-gradient(180deg, #2a2a2e 0%, #1a1a1e 50%, #111114 100%)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow:
                            "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 12px rgba(0,0,0,0.4)",
                    }}
                >
                    {(["red", "yellow", "green"] as const).map((bulbPhase) => {
                        const isActive = bulbPhase === phase;
                        const bulbConfig = PHASE_CONFIG[bulbPhase];

                        return (
                            <div
                                key={bulbPhase}
                                className="relative rounded-full"
                                style={{
                                    width: 18,
                                    height: 18,
                                    background: isActive
                                        ? `radial-gradient(circle at 40% 35%, ${bulbConfig.color}, color-mix(in oklch, ${bulbConfig.color} 70%, black))`
                                        : "radial-gradient(circle at 40% 35%, #3a3a3e, #1a1a1e)",
                                    boxShadow: isActive
                                        ? `0 0 8px 1px ${bulbConfig.glow}, 0 0 16px 2px ${bulbConfig.glow}, inset 0 -2px 4px rgba(0,0,0,0.3)`
                                        : "inset 0 2px 4px rgba(0,0,0,0.5), inset 0 -1px 2px rgba(255,255,255,0.04)",
                                    transition: "box-shadow 0.4s ease, background 0.4s ease",
                                }}
                            />
                        );
                    })}
                </div>

                {/* Timer without arc */}
                <div className="relative flex items-center justify-center mt-1 mb-1">
                    <span
                        className="text-4xl"
                        style={{
                            // Pixelated, jagged system font stack simulating realistic LED segments
                            fontFamily: "'Courier New', Courier, monospace",
                            fontWeight: 900,
                            letterSpacing: "0.05em",
                            color: config.color,
                            textShadow: `0 0 8px ${config.glow}, 0 0 2px ${config.color}`,
                        }}
                    >
                        {timerDisplay}
                    </span>
                </div>

                {/* Phase label */}
                <div
                    className="text-[10px] tracking-[0.3em] uppercase font-bold opacity-80"
                    style={{ color: config.color, textShadow: `0 0 4px ${config.glow}` }}
                >
                    {config.label}
                </div>
            </div>
        </div>
    );
}
