import { useTrafficLight, type TrafficPhase } from "@/hooks/useTrafficLight";
import { TrafficLightPod } from "./TrafficLightPod";

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

function ArrowSVG({ pos, rot, animate }: { pos: string; rot: string; animate: boolean }) {
    return (
        <div
            className={`absolute ${pos} ${rot} pointer-events-none z-10 ${animate ? "animate-pulse opacity-80" : "opacity-40"}`}
            style={{
                filter: animate ? "drop-shadow(0 2px 8px rgba(255,255,255,0.8))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                transition: "opacity 0.3s ease, filter 0.3s ease"
            }}
        >
            <svg width="28" height="72" viewBox="0 0 24 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 22H8V62H16V22H22L12 2Z" fill="#ffffff" />
            </svg>
        </div>
    );
}

function LaneArrows({ direction, phase }: { direction: "N" | "S" | "E" | "W"; phase: TrafficPhase }) {
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

    const isGreen = phase === "green";
    return (
        <>
            <ArrowSVG pos={incomingPos} rot={incomingRot} animate={false} />
            <ArrowSVG pos={outgoingPos} rot={outgoingRot} animate={isGreen} />
        </>
    );
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

function RoadCell({ direction }: { direction: "N" | "S" | "E" | "W" }) {
    const { phase } = useTrafficLight(direction);
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
            <LaneArrows direction={direction} phase={phase} />
        </div>
    );
}

export function IntersectionGrid() {
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
            <RoadCell direction="N" />
            <EmptyCell />
            <RoadCell direction="W" />
            <IntersectionCenter />
            <RoadCell direction="E" />
            <EmptyCell />
            <RoadCell direction="S" />
            <EmptyCell />
        </div>
    );
}
