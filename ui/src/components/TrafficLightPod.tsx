import { useState, useCallback } from "react";
import type { TrafficPhase } from "@/hooks/useTrafficLight";
import { TrafficLightCard } from "./TrafficLightCard";

interface TrafficLightPodProps {
    direction: "N" | "S" | "E" | "W";
    phase: TrafficPhase;
    secondsRemaining: number;
    totalPhaseDuration: number;
}

const PHASE_COLORS: Record<TrafficPhase, { bg: string; glow: string; ambient: string }> = {
    red: {
        bg: "var(--light-red)",
        glow: "var(--glow-red)",
        ambient: "var(--ambient-red)",
    },
    yellow: {
        bg: "var(--light-yellow)",
        glow: "var(--glow-yellow)",
        ambient: "var(--ambient-yellow)",
    },
    green: {
        bg: "var(--light-green)",
        glow: "var(--glow-green)",
        ambient: "var(--ambient-green)",
    },
} as const;

export function TrafficLightPod({
    direction,
    phase,
    secondsRemaining,
    totalPhaseDuration,
}: TrafficLightPodProps) {
    const [hovered, setHovered] = useState(false);
    const [showCard, setShowCard] = useState(false);

    const colors = PHASE_COLORS[phase];
    const timerDisplay = String(secondsRemaining).padStart(2, "0");

    const handleMouseEnter = useCallback(() => {
        setHovered(true);
        setShowCard(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setHovered(false);
        // Delay hiding for exit animation
        setTimeout(() => setShowCard(false), 160);
    }, []);

    return (
        <div
            className="relative flex items-center justify-center cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Wide ambient glow on road surface */}
            <div
                className="absolute rounded-full transition-glow"
                style={{
                    width: 80,
                    height: 80,
                    background: `radial-gradient(circle, ${colors.ambient} 0%, transparent 70%)`,
                }}
            />

            {/* Primary glow circle */}
            <div
                className="relative z-10 rounded-full transition-glow"
                style={{
                    width: 14,
                    height: 14,
                    backgroundColor: colors.bg,
                    boxShadow: `
            0 0 6px 2px ${colors.glow},
            0 0 16px 6px ${colors.glow},
            0 0 32px 12px ${colors.ambient}
          `,
                }}
            />

            {/* Direction label */}
            <span
                className="absolute z-10 text-[8px] tracking-[0.15em] uppercase font-medium"
                style={{
                    color: "var(--text-overlay)",
                    ...(direction === "N" || direction === "S"
                        ? { left: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" }
                        : { top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" }),
                }}
            >
                {direction}
            </span>

            {/* Tiny timer beside the dot */}
            <span
                className="absolute z-10 text-[9px] tabular-nums font-medium"
                style={{
                    color: "var(--text-overlay)",
                    opacity: 0.6,
                    ...(direction === "N" || direction === "S"
                        ? { right: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" }
                        : { bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" }),
                }}
            >
                {timerDisplay}
            </span>

            {/* Hover card */}
            {showCard && (
                <TrafficLightCard
                    phase={phase}
                    secondsRemaining={secondsRemaining}
                    totalPhaseDuration={totalPhaseDuration}
                    direction={direction}
                    visible={hovered}
                />
            )}
        </div>
    );
}
