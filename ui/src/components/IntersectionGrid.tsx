import { useTrafficLight } from "@/hooks/useTrafficLight";
import { TrafficLightPod } from "./TrafficLightPod";

/* ── Direction Offsets (staggered start in the 19s cycle) ────── */
const OFFSETS = { N: 0, E: 5, S: 10, W: 15 } as const;

/* ── Road Surface CSS ─────────────────────────────────────────── */
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
            // Asphalt texture — fine grain
            `repeating-linear-gradient(${isV ? "0deg" : "90deg"}, transparent 0px, rgba(0,0,0,0.015) 1px, transparent 2px)`,
            // Center dashed lane divider
            `repeating-linear-gradient(${isV ? "180deg" : "90deg"}, var(--lane-divider) 0px, var(--lane-divider) 16px, transparent 16px, transparent 36px)`,
        ].join(", "),
        backgroundSize: isV
            ? "100% 2px, 2px 36px"
            : "2px 100%, 36px 2px",
        backgroundPosition: isV
            ? "0 0, center 0"
            : "0 0, 0 center",
    };
}

/* ── Edge lines overlay ───────────────────────────────────────── */
function EdgeLines({ direction }: { direction: "vertical" | "horizontal" }) {
    const isV = direction === "vertical";
    return (
        <>
            {/* Left / Top edge */}
            <div
                className="absolute"
                style={{
                    ...(isV
                        ? { left: 0, top: 0, bottom: 0, width: 2 }
                        : { top: 0, left: 0, right: 0, height: 2 }),
                    backgroundColor: "var(--road-edge)",
                }}
            />
            {/* Right / Bottom edge */}
            <div
                className="absolute"
                style={{
                    ...(isV
                        ? { right: 0, top: 0, bottom: 0, width: 2 }
                        : { bottom: 0, left: 0, right: 0, height: 2 }),
                    backgroundColor: "var(--road-edge)",
                }}
            />
        </>
    );
}

/* ── Crosswalk stripes ────────────────────────────────────────── */
function Crosswalk({
    position,
}: {
    position: "top" | "bottom" | "left" | "right";
}) {
    const isH = position === "left" || position === "right";
    // Zebra crossing should span close to the road edges but leave a tiny margin
    return (
        <div
            className="absolute"
            style={{
                ...(position === "top" && {
                    bottom: 2,
                    left: 4,
                    right: 4,
                    height: 24, // Thicker zebra lines
                }),
                ...(position === "bottom" && {
                    top: 2,
                    left: 4,
                    right: 4,
                    height: 24,
                }),
                ...(position === "left" && {
                    right: 2,
                    top: 4,
                    bottom: 4,
                    width: 24,
                }),
                ...(position === "right" && {
                    left: 2,
                    top: 4,
                    bottom: 4,
                    width: 24,
                }),
                backgroundImage: isH
                    ? `repeating-linear-gradient(0deg, var(--crosswalk) 0px, var(--crosswalk) 5px, transparent 5px, transparent 10px)`
                    : `repeating-linear-gradient(90deg, var(--crosswalk) 0px, var(--crosswalk) 5px, transparent 5px, transparent 10px)`,
                backgroundSize: isH ? "100% 10px" : "10px 100%",
            }}
        />
    );
}

/* ── Empty Corner Cell (replaces Grass) ───────────────────────── */
function EmptyCell() {
    return (
        <div
            className="transition-theme w-full h-full bg-[var(--background)]"
        />
    );
}

/* ── Intersection Center (4 Boxes) ────────────────────────────── */
function IntersectionCenter() {
    return (
        <div
            className="w-full h-full relative p-1"
            style={{ backgroundColor: "var(--intersection-surface)" }}
        >
            {/* Inner grid creating the 4 boxes divided by lane lines */}
            <div
                className="absolute inset-0 grid grid-cols-2 grid-rows-2 transition-theme"
                style={{ gap: "2px", backgroundColor: "var(--lane-divider)" }}
            >
                <div className="bg-[var(--intersection-surface)] w-full h-full transition-theme border border-[var(--road-edge)]/40 shadow-inner"></div>
                <div className="bg-[var(--intersection-surface)] w-full h-full transition-theme border border-[var(--road-edge)]/40 shadow-inner"></div>
                <div className="bg-[var(--intersection-surface)] w-full h-full transition-theme border border-[var(--road-edge)]/40 shadow-inner"></div>
                <div className="bg-[var(--intersection-surface)] w-full h-full transition-theme border border-[var(--road-edge)]/40 shadow-inner"></div>
            </div>
            {/* Ambient depth vignette */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.15) 100%)",
                }}
            />
        </div>
    );
}

/* ── Pod positioning per direction ─────────────────────────────── */
const POD_POSITION: Record<
    string,
    { align: string; justify: string; style: React.CSSProperties }
> = {
    N: {
        align: "items-end",
        justify: "justify-center",
        style: { paddingBottom: 36 },
    },
    S: {
        align: "items-start",
        justify: "justify-center",
        style: { paddingTop: 36 },
    },
    E: {
        align: "items-center",
        justify: "justify-start",
        style: { paddingLeft: 36 },
    },
    W: {
        align: "items-center",
        justify: "justify-end",
        style: { paddingRight: 36 },
    },
};

/* ── Road Cell with Pod ───────────────────────────────────────── */
function RoadCell({
    direction,
}: {
    direction: "N" | "S" | "E" | "W";
}) {
    const { phase, secondsRemaining, totalPhaseDuration } = useTrafficLight(
        OFFSETS[direction]
    );
    const isVertical = direction === "N" || direction === "S";
    const pos = POD_POSITION[direction];

    // Subtle ambient gradient for depth
    const ambientGradient = (() => {
        switch (direction) {
            case "N":
                return "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 60%)";
            case "S":
                return "linear-gradient(0deg, rgba(255,255,255,0.03) 0%, transparent 60%)";
            case "E":
                return "linear-gradient(270deg, rgba(255,255,255,0.03) 0%, transparent 60%)";
            case "W":
                return "linear-gradient(90deg, rgba(255,255,255,0.03) 0%, transparent 60%)";
        }
    })();

    return (
        <div
            className={`relative flex ${pos.align} ${pos.justify} transition-theme`}
            style={{
                ...roadGradient(isVertical ? "vertical" : "horizontal"),
            }}
        >
            <EdgeLines direction={isVertical ? "vertical" : "horizontal"} />
            <Crosswalk
                position={
                    direction === "N"
                        ? "bottom"
                        : direction === "S"
                            ? "top"
                            : direction === "E"
                                ? "left"
                                : "right"
                }
            />
            {/* Ambient depth gradient */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: ambientGradient }}
            />
            {/* Traffic light pod */}
            <div style={pos.style} className="z-20">
                <TrafficLightPod
                    direction={direction}
                    phase={phase}
                    secondsRemaining={secondsRemaining}
                    totalPhaseDuration={totalPhaseDuration}
                />
            </div>
        </div>
    );
}

/* ── Main Grid ────────────────────────────────────────────────── */
export function IntersectionGrid() {
    return (
        <div
            className="w-full h-full bg-[var(--background)] transition-theme"
            style={{
                display: "grid",
                // Making the roads narrower: dynamic width up to 240px
                gridTemplateColumns: "1fr min(25vw, 240px) 1fr",
                gridTemplateRows: "1fr min(25vw, 240px) 1fr",
            }}
        >
            {/* Row 1: Empty | North Road | Empty */}
            <EmptyCell />
            <RoadCell direction="N" />
            <EmptyCell />

            {/* Row 2: West Road | Intersection | East Road */}
            <RoadCell direction="W" />
            <IntersectionCenter />
            <RoadCell direction="E" />

            {/* Row 3: Empty | South Road | Empty */}
            <EmptyCell />
            <RoadCell direction="S" />
            <EmptyCell />
        </div>
    );
}
