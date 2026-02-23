import { motion } from "framer-motion";
import type { TrafficPhase } from "@/hooks/useTrafficLight";

interface TimerDisplayProps {
    secondsRemaining: number;
    totalPhaseDuration: number;
    phase: TrafficPhase;
    isPreGreen: boolean;
    orientation?: "vertical" | "horizontal";
}

const PHASE_COLORS: Record<TrafficPhase, string> = {
    red: "var(--light-red)",
    yellow: "var(--light-yellow)",
    green: "var(--light-green)",
};

export function TimerDisplay({
    secondsRemaining,
    totalPhaseDuration,
    phase,
    isPreGreen,
    orientation = "vertical",
}: TimerDisplayProps) {
    const isH = orientation === "horizontal";
    const color = PHASE_COLORS[phase];

    let label = "";
    if (phase === "red") label = "STOP";
    if (phase === "yellow") label = isPreGreen ? "READY" : "CAUTION";
    if (phase === "green") label = "GO";

    // Progress for the SVG arc
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    // We want dashoffset to be 0 when full time remains, and circumference when 0 seconds.
    // Progress starts at 1, goes to 0
    const progress = totalPhaseDuration > 0 ? secondsRemaining / totalPhaseDuration : 0;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className={`flex items-center gap-2 ${isH ? "flex-row" : "flex-col"}`}>
            <div className="relative flex items-center justify-center pointer-events-none" style={{ width: 40, height: 40 }}>
                {/* Background Arc */}
                <svg width="40" height="40" className="absolute -rotate-90">
                    <circle cx="20" cy="20" r={radius} fill="none" stroke="currentColor" strokeWidth="3" className="opacity-20" style={{ color }} />
                    <motion.circle
                        cx="20" cy="20" r={radius} fill="none" stroke="currentColor" strokeWidth="3"
                        strokeDasharray={circumference}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 0.5, ease: "linear" }}
                        strokeLinecap="round"
                        style={{ color }}
                    />
                </svg>
                {/* Zero-padded timer */}
                <span className="font-mono font-bold text-sm absolute z-10" style={{ color: "var(--foreground)" }}>
                    {String(secondsRemaining).padStart(2, "0")}
                </span>
            </div>

            {/* Label */}
            <span
                className="font-bold tracking-widest text-[10px] uppercase pointer-events-none"
                style={{ color, textShadow: `0 0 8px ${color}80` }}
            >
                {label}
            </span>
        </div>
    );
}
