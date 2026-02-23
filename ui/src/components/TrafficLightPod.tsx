import { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TrafficPhase } from "@/hooks/useTrafficLight";
import { TrafficLightCard } from "./TrafficLightCard";
import { UIToggleContext } from "@/App";

interface TrafficLightPodProps {
    direction: "N" | "S" | "E" | "W";
    phase: TrafficPhase;
    secondsRemaining: number;
    totalPhaseDuration: number;
    isPreGreen: boolean;
    waitingTimeSeconds: number;
    signalId: string;
    laneName: string;
    orientation?: "vertical" | "horizontal";
}

const PHASE_CONFIG: Record<
    TrafficPhase,
    { color: string; glow: string; ambient: string }
> = {
    red: {
        color: "var(--light-red)",
        glow: "var(--glow-red)",
        ambient: "var(--ambient-red)",
    },
    yellow: {
        color: "var(--light-yellow)",
        glow: "var(--glow-yellow)",
        ambient: "var(--ambient-yellow)",
    },
    green: {
        color: "var(--light-green)",
        glow: "var(--glow-green)",
        ambient: "var(--ambient-green)",
    },
} as const;

const BULB_ORDER: TrafficPhase[] = ["red", "yellow", "green"];

export function TrafficLightPod({
    direction,
    phase,
    secondsRemaining,
    totalPhaseDuration,
    isPreGreen,
    waitingTimeSeconds,
    signalId,
    laneName,
    orientation = "vertical",
}: TrafficLightPodProps) {
    const [isHovered, setIsHovered] = useState(false);
    const { showAllCards, highlightActive } = useContext(UIToggleContext);

    const config = PHASE_CONFIG[phase];
    const isH = orientation === "horizontal";

    const beamRotation = {
        N: 180,
        E: -90,
        S: 0,
        W: 90,
    }[direction];

    const isDimmed = highlightActive && phase !== "green";
    const shouldShowCard = showAllCards || isHovered;

    return (
        <motion.div
            className={`relative flex items-center justify-center transition-all duration-300 z-40`}
            style={{ opacity: isDimmed ? 0.35 : 1 }}
            whileHover={{ scale: 1.08 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="p-1.5 rounded-2xl bg-white dark:bg-stone-800 shadow-xl border border-stone-300 dark:border-stone-700 z-10">
                <div
                    className={`relative flex gap-[6px] ${isH ? "flex-row py-2 px-3" : "flex-col p-2 px-3"} rounded-[10px] z-10`}
                    style={{
                        background: isH
                            ? "linear-gradient(90deg, #2a2a2e 0%, #1a1a1e 50%, #111114 100%)"
                            : "linear-gradient(180deg, #2a2a2e 0%, #1a1a1e 50%, #111114 100%)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 10px rgba(0,0,0,0.5)",
                    }}
                >
                    {BULB_ORDER.map((bulbPhase) => {
                        const isActive = bulbPhase === phase;
                        const bulbConfig = PHASE_CONFIG[bulbPhase];
                        const isPulsing = isActive && bulbPhase === "yellow" && isPreGreen;

                        return (
                            <div
                                key={bulbPhase}
                                className="relative rounded-full shrink-0 flex items-center justify-center"
                                style={{
                                    width: 22,
                                    height: 22,
                                    background: isActive
                                        ? `radial-gradient(circle at 40% 35%, ${bulbConfig.color}, color-mix(in oklch, ${bulbConfig.color} 70%, black))`
                                        : "radial-gradient(circle at 40% 35%, #3a3a3e, #1a1a1e)",
                                    boxShadow: isActive
                                        ? `inset 0 -2px 4px rgba(0,0,0,0.3)`
                                        : "inset 0 2px 4px rgba(0,0,0,0.5), inset 0 -1px 2px rgba(255,255,255,0.04)",
                                    transition: "background 0.4s ease, box-shadow 0.4s ease",
                                }}
                            >
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            initial={{ opacity: 0.5 }}
                                            animate={
                                                isPulsing
                                                    ? { scale: [1, 1.12, 1] }
                                                    : { opacity: 1 }
                                            }
                                            transition={
                                                isPulsing
                                                    ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
                                                    : { duration: 0.3 }
                                            }
                                            className="absolute inset-0 rounded-full"
                                            style={{
                                                boxShadow: `0 0 8px 2px ${bulbConfig.glow}, 0 0 20px 4px ${bulbConfig.glow}`,
                                            }}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Glowing beam */}
            <div
                className="absolute z-0 pointer-events-none transition-glow"
                style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: `radial-gradient(ellipse at center, ${config.ambient} 0%, transparent 60%)`,
                    transform: `rotate(${beamRotation}deg) translateY(50px) scaleY(1.4)`,
                }}
            />

            {/* Hover / Toggle Detail Card */}
            <TrafficLightCard
                phase={phase}
                secondsRemaining={secondsRemaining}
                totalPhaseDuration={totalPhaseDuration}
                direction={direction}
                visible={shouldShowCard}
                isPreGreen={isPreGreen}
                waitingTimeSeconds={waitingTimeSeconds}
                signalId={signalId}
                laneName={laneName}
            />
        </motion.div>
    );
}
