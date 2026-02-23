import { useContext } from "react";
import { useTrafficLight } from "@/hooks/useTrafficLight";
import { TrafficLightPod } from "./TrafficLightPod";
import { TrafficContext } from "@/hooks/useIntersection";

const roadBase: React.CSSProperties = {
    backgroundColor: "var(--road-surface)",
    position: "relative",
    overflow: "hidden",
    transition: "background-color 0.5s ease",
};

function roadGradient(dir: "vertical" | "horizontal"): React.CSSProperties {
    const isV = dir === "vertical";
    return {
        ...roadBase,
        backgroundImage: [
            `repeating-linear-gradient(${isV ? "0deg" : "90deg"}, transparent 0px, rgba(0,0,0,0.015) 1px, transparent 2px)`,
            `linear-gradient(${isV ? "90deg" : "180deg"}, transparent calc(50% - 3px), var(--lane-divider-yellow) calc(50% - 3px), var(--lane-divider-yellow) calc(50% - 1px), transparent calc(50% - 1px))`,
            `linear-gradient(${isV ? "90deg" : "180deg"}, transparent calc(50% + 1px), var(--lane-divider-yellow) calc(50% + 1px), var(--lane-divider-yellow) calc(50% + 3px), transparent calc(50% + 3px))`
        ].join(", "),
    };
}

function EdgeLines({ direction }: { direction: "vertical" | "horizontal" }) {
    const isV = direction === "vertical";
    return (
        <>
            <div
                className="absolute"
                style={{
                    ...(isV ? { left: 0, top: 0, bottom: 0, width: 2 } : { top: 0, left: 0, right: 0, height: 2 }),
                    backgroundColor: "var(--road-edge)",
                }}
            />
            <div
                className="absolute"
                style={{
                    ...(isV ? { right: 0, top: 0, bottom: 0, width: 2 } : { bottom: 0, left: 0, right: 0, height: 2 }),
                    backgroundColor: "var(--road-edge)",
                }}
            />
        </>
    );
}

function Crosswalk({ position }: { position: "top" | "bottom" | "left" | "right" }) {
    const isH = position === "left" || position === "right";
    return (
        <div
            className="absolute z-10"
            style={{
                ...(position === "top" && { bottom: 2, left: 4, right: 4, height: 24 }),
                ...(position === "bottom" && { top: 2, left: 4, right: 4, height: 24 }),
                ...(position === "left" && { right: 2, top: 4, bottom: 4, width: 24 }),
                ...(position === "right" && { left: 2, top: 4, bottom: 4, width: 24 }),
                backgroundImage: isH
                    ? `repeating-linear-gradient(0deg, var(--crosswalk) 0px, var(--crosswalk) 5px, transparent 5px, transparent 10px)`
                    : `repeating-linear-gradient(90deg, var(--crosswalk) 0px, var(--crosswalk) 5px, transparent 5px, transparent 10px)`,
                backgroundSize: isH ? "100% 10px" : "10px 100%",
            }}
        />
    );
}

function EmptyCell() {
    return (
        <div
            className="transition-theme w-full h-full bg-stone-200 dark:bg-stone-900"
            style={{
                backgroundImage: "radial-gradient(rgba(0,0,0,0.07) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.07) 1px, transparent 1px)",
                backgroundPosition: "0 0, 20px 20px",
                backgroundSize: "40px 40px",
            }}
        />
    );
}

/*
 * Two arrow states only:
 *   "active" → 100% opacity, ghost white (active green signal lane)
 *   "dimmed" →  40% opacity, same white  (all red signal lanes)
 */
type ArrowState = "active" | "dimmed";

const ARROW_OPACITY: Record<ArrowState, number> = {
    active: 1,
    dimmed: 0.4,
};

/**
 * Road marking arrow — flat, no glow, no shadow.
 * Active = ghost white at full opacity. Dimmed = 40%.
 * Includes optional label for active arrows only.
 */
function ArrowSVG({ pos, rot, state, label, isVertical }: {
    pos: string;
    rot: string;
    state: ArrowState;
    label?: string;
    isVertical: boolean;
}) {
    const showLabel = state === "active" && label;

    return (
        <div
            className={`absolute ${pos} ${rot} pointer-events-none z-10
                        flex ${isVertical ? "flex-col" : "flex-row"} items-center gap-1`}
            style={{
                opacity: ARROW_OPACITY[state],
                transition: "opacity 0.4s ease",
            }}
        >
            {/* Label above/before arrow tip (only for active) */}
            {showLabel && (
                <span
                    className="font-mono text-[10px] uppercase tracking-widest text-white whitespace-nowrap"
                    style={{
                        opacity: 1,
                        transition: "opacity 0.3s ease",
                    }}
                >
                    {label}
                </span>
            )}
            <svg width="28" height="72" viewBox="0 0 24 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 22H8V62H16V22H22L12 2Z" fill="#f5f5f5" />
            </svg>
        </div>
    );
}

/*
 * ARROW-TO-SIGNAL MAPPING
 *
 *   Road | Incoming Arrow         | Signal | Outgoing Arrow          | Signal
 *   -----+------------------------+--------+-------------------------+-------
 *   N    | ↓ (south, NS traffic)  | L2     | ↑ (north, SN traffic)   | L4
 *   S    | ↑ (north, SN traffic)  | L4     | ↓ (south, NS traffic)   | L2
 *   E    | ← (west, EW traffic)   | L3     | → (east, WE traffic)    | L1
 *   W    | → (east, WE traffic)   | L1     | ← (west, EW traffic)    | L3
 */
const ARROW_SIGNAL: Record<string, { incoming: string; outgoing: string }> = {
    N: { incoming: "L2", outgoing: "L4" },
    S: { incoming: "L4", outgoing: "L2" },
    E: { incoming: "L3", outgoing: "L1" },
    W: { incoming: "L1", outgoing: "L3" },
};

function resolveArrowState(arrowSignal: string, activeSignal: string): ArrowState {
    return arrowSignal === activeSignal ? "active" : "dimmed";
}

function LaneArrows({ direction, activeSignal }: { direction: "N" | "S" | "E" | "W"; activeSignal: string }) {
    const mapping = ARROW_SIGNAL[direction];
    const inState = resolveArrowState(mapping.incoming, activeSignal);
    const outState = resolveArrowState(mapping.outgoing, activeSignal);
    const isVertical = direction === "N" || direction === "S";
    const activeLabel = `${activeSignal} Vehicles`;

    let incomingPos = "";
    let incomingRot = "";
    let outgoingPos = "";
    let outgoingRot = "";

    switch (direction) {
        case "N":
            incomingPos = "bottom-16 right-1/4 translate-x-1/2";
            incomingRot = "rotate-180";
            outgoingPos = "bottom-16 left-1/4 -translate-x-1/2";
            outgoingRot = "rotate-0";
            break;
        case "S":
            incomingPos = "top-16 left-1/4 -translate-x-1/2";
            incomingRot = "rotate-0";
            outgoingPos = "top-16 right-1/4 translate-x-1/2";
            outgoingRot = "rotate-180";
            break;
        case "E":
            incomingPos = "left-16 bottom-1/4 translate-y-1/2";
            incomingRot = "-rotate-90";
            outgoingPos = "left-16 top-1/4 -translate-y-1/2";
            outgoingRot = "rotate-90";
            break;
        case "W":
            incomingPos = "right-16 top-1/4 -translate-y-1/2";
            incomingRot = "rotate-90";
            outgoingPos = "right-16 bottom-1/4 translate-y-1/2";
            outgoingRot = "-rotate-90";
            break;
    }

    return (
        <>
            <ArrowSVG
                pos={incomingPos}
                rot={incomingRot}
                state={inState}
                label={inState === "active" ? activeLabel : undefined}
                isVertical={isVertical}
            />
            <ArrowSVG
                pos={outgoingPos}
                rot={outgoingRot}
                state={outState}
                label={outState === "active" ? activeLabel : undefined}
                isVertical={isVertical}
            />
        </>
    );
}

/** Derive active signal ID ("L1"/"L2"/"L3"/"L4") from the currentPhase string */
function deriveActiveSignal(phase: string | null): string {
    if (!phase) return "";
    if (phase.includes("L1")) return "L1";
    if (phase.includes("L2")) return "L2";
    if (phase.includes("L3")) return "L3";
    if (phase.includes("L4")) return "L4";
    return "";
}

function IntersectionCenter() {
    const nPhase = useTrafficLight("N");
    const ePhase = useTrafficLight("E");
    const sPhase = useTrafficLight("S");
    const wPhase = useTrafficLight("W");

    return (
        <div
            className="w-full h-full relative transition-theme z-20 flex items-center justify-center overflow-visible"
            style={{ backgroundColor: "var(--road-surface-dark)" }}
        >
            {/* Ambient depth vignette */}
            <div
                className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-20"
                style={{ backgroundImage: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.9) 100%)" }}
            />

            {/* Center Pole */}
            <div className="absolute w-8 h-8 rounded-full bg-stone-400 dark:bg-stone-600 shadow-lg border-2 border-stone-500 dark:border-stone-500 z-50 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-white/60" />
            </div>

            {/* North Pod (L1) */}
            <div className="absolute" style={{ transform: "translateY(-85px)" }}>
                <TrafficLightPod
                    direction="N"
                    phase={nPhase.phase}
                    secondsRemaining={nPhase.secondsRemaining}
                    totalPhaseDuration={nPhase.totalPhaseDuration}
                    isPreGreen={nPhase.isPreGreen}
                    waitingTimeSeconds={nPhase.waitingTimeSeconds}
                    signalId={nPhase.signalId}
                    laneName={nPhase.laneName}
                />
            </div>

            {/* South Pod (L3) */}
            <div className="absolute" style={{ transform: "translateY(85px)" }}>
                <TrafficLightPod
                    direction="S"
                    phase={sPhase.phase}
                    secondsRemaining={sPhase.secondsRemaining}
                    totalPhaseDuration={sPhase.totalPhaseDuration}
                    isPreGreen={sPhase.isPreGreen}
                    waitingTimeSeconds={sPhase.waitingTimeSeconds}
                    signalId={sPhase.signalId}
                    laneName={sPhase.laneName}
                />
            </div>

            {/* East Pod (L2) */}
            <div className="absolute" style={{ transform: "translateX(95px)" }}>
                <TrafficLightPod
                    direction="E"
                    phase={ePhase.phase}
                    secondsRemaining={ePhase.secondsRemaining}
                    totalPhaseDuration={ePhase.totalPhaseDuration}
                    isPreGreen={ePhase.isPreGreen}
                    waitingTimeSeconds={ePhase.waitingTimeSeconds}
                    signalId={ePhase.signalId}
                    laneName={ePhase.laneName}
                    orientation="horizontal"
                />
            </div>

            {/* West Pod (L4) */}
            <div className="absolute" style={{ transform: "translateX(-95px)" }}>
                <TrafficLightPod
                    direction="W"
                    phase={wPhase.phase}
                    secondsRemaining={wPhase.secondsRemaining}
                    totalPhaseDuration={wPhase.totalPhaseDuration}
                    isPreGreen={wPhase.isPreGreen}
                    waitingTimeSeconds={wPhase.waitingTimeSeconds}
                    signalId={wPhase.signalId}
                    laneName={wPhase.laneName}
                    orientation="horizontal"
                />
            </div>
        </div>
    );
}

function RoadCell({ direction, activeSignal }: { direction: "N" | "S" | "E" | "W"; activeSignal: string }) {
    const isVertical = direction === "N" || direction === "S";

    const ambientGradient = (() => {
        switch (direction) {
            case "N": return "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 60%)";
            case "S": return "linear-gradient(0deg, rgba(255,255,255,0.03) 0%, transparent 60%)";
            case "E": return "linear-gradient(270deg, rgba(255,255,255,0.03) 0%, transparent 60%)";
            case "W": return "linear-gradient(90deg, rgba(255,255,255,0.03) 0%, transparent 60%)";
        }
    })();

    return (
        <div
            className="relative flex items-center justify-center transition-theme"
            style={{ ...roadGradient(isVertical ? "vertical" : "horizontal") }}
        >
            <EdgeLines direction={isVertical ? "vertical" : "horizontal"} />
            <Crosswalk
                position={direction === "N" ? "bottom" : direction === "S" ? "top" : direction === "E" ? "left" : "right"}
            />
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: ambientGradient }} />
            <LaneArrows direction={direction} activeSignal={activeSignal} />
        </div>
    );
}

export function IntersectionGrid() {
    const ctx = useContext(TrafficContext);
    const activeSignal = deriveActiveSignal(ctx?.phase ?? null);

    return (
        <div
            className="w-full h-full bg-[var(--background)] transition-theme"
            style={{
                display: "grid",
                gridTemplateColumns: "1fr min(45vw, 360px) 1fr",
                gridTemplateRows: "1fr min(45vw, 360px) 1fr",
            }}
        >
            <EmptyCell />
            <RoadCell direction="N" activeSignal={activeSignal} />
            <EmptyCell />
            <RoadCell direction="W" activeSignal={activeSignal} />
            <IntersectionCenter />
            <RoadCell direction="E" activeSignal={activeSignal} />
            <EmptyCell />
            <RoadCell direction="S" activeSignal={activeSignal} />
            <EmptyCell />
        </div>
    );
}
