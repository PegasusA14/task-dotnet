import { useState, useRef, useEffect } from "react";
import type { TrafficPhase } from "@/hooks/useTrafficLight";
import { TrafficLightCard } from "./TrafficLightCard";

interface TrafficLightPodProps {
    direction: "N" | "S" | "E" | "W";
    phase: TrafficPhase;
    secondsRemaining: number;
}

const PHASE_CONFIG: Record<
    TrafficPhase,
    { color: string; glow: string; label: string; ambient: string }
> = {
    red: {
        color: "var(--light-red)",
        glow: "var(--glow-red)",
        label: "STOP",
        ambient: "var(--ambient-red)",
    },
    yellow: {
        color: "var(--light-yellow)",
        glow: "var(--glow-yellow)",
        label: "READY",
        ambient: "var(--ambient-yellow)",
    },
    green: {
        color: "var(--light-green)",
        glow: "var(--glow-green)",
        label: "GO",
        ambient: "var(--ambient-green)",
    },
} as const;

const BULB_ORDER: TrafficPhase[] = ["red", "yellow", "green"];

export function TrafficLightPod({
    direction,
    phase,
    secondsRemaining,
}: TrafficLightPodProps) {
    const config = PHASE_CONFIG[phase];
    const prevPhaseRef = useRef(phase);
    const pulseRef = useRef<HTMLDivElement>(null);

    const [hovered, setHovered] = useState(false);
    const [showCard, setShowCard] = useState(false);

    const handleMouseEnter = () => {
        setHovered(true);
        setShowCard(true);
    };

    const handleMouseLeave = () => {
        setHovered(false);
        setTimeout(() => setShowCard(false), 160);
    };

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

    // The glowing beam projection should still point toward oncoming traffic
    const beamRotation = {
        N: 180, // Faces North lane
        E: -90, // Faces East lane
        S: 0,   // Faces South lane
        W: 90,  // Faces West lane
    }[direction];

    return (
        <div
            className="relative flex items-center justify-center cursor-pointer transition-theme z-40 transform scale-90"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* White Container background */}
            <div
                className="relative flex flex-col items-center p-2 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl transition-transform"
                style={{
                    boxShadow: `0 8px 24px -4px ${config.glow}, 0 4px 12px rgba(0,0,0,0.15)`,
                }}
            >
                {/* The Main Realistic Housing (Black) */}
                <div
                    className="relative flex flex-col items-center gap-[6px] p-2 px-3 rounded-lg"
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
            </div>

            {/* Glowing beam projected onto road surface */}
            <div
                className="absolute z-0 pointer-events-none transition-glow"
                style={{
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    background: `radial-gradient(ellipse at center, ${config.ambient} 0%, transparent 60%)`,
                    transform: `rotate(${beamRotation}deg) translateY(40px) scaleY(1.4)`,
                }}
            />

            {/* Hover card containing traffic info & pixel timer */}
            {showCard && (
                <TrafficLightCard
                    phase={phase}
                    secondsRemaining={secondsRemaining}
                    direction={direction}
                    visible={hovered}
                />
            )}
        </div>
    );
}
