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

    // Create a double yellow line instead of a dashed white line
    // Two 2px solid yellow lines separated by a 2px gap (total 6px width)
    return {
        ...roadBase,
        backgroundImage: [
            // Asphalt texture — fine grain
            `repeating-linear-gradient(${isV ? "0deg" : "90deg"}, transparent 0px, rgba(0,0,0,0.015) 1px, transparent 2px)`,
            // Left/Top yellow line
            `linear-gradient(${isV ? "90deg" : "180deg"}, transparent calc(50% - 3px), var(--lane-divider-yellow) calc(50% - 3px), var(--lane-divider-yellow) calc(50% - 1px), transparent calc(50% - 1px))`,
            // Right/Bottom yellow line
            `linear-gradient(${isV ? "90deg" : "180deg"}, transparent calc(50% + 1px), var(--lane-divider-yellow) calc(50% + 1px), var(--lane-divider-yellow) calc(50% + 3px), transparent calc(50% + 3px))`
        ].join(", "),
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
    // Responsive sizing for the crosswalk to fit the road widths
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

/* ── Empty Corner Cell ────────────────────────────────────────── */
function EmptyCell() {
    return (
        <div
            className="transition-theme w-full h-full bg-[var(--background)] bg-grid-pattern"
        />
    );
}

/* ── Intersection Center ──────────────────────────────────────── */
function IntersectionCenter() {
    return (
        <div
            className="w-full h-full relative"
            style={{ backgroundColor: "var(--intersection-surface)" }}
        >
            {/*
        Inner grid creating the 4 boxes divided by lane lines.
        Using the background intersection-surface color.
      */}
            <div
                className="absolute inset-0 grid grid-cols-2 grid-rows-2 transition-theme p-2"
                style={{ gap: "2px", backgroundColor: "var(--road-edge)", padding: "8px" }}
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
// The traffic lights are moved directly onto the intersection boxes now
const POD_POSITION: Record<
    string,
    { align: string; justify: string; style: React.CSSProperties }
> = {
    // We place the pod closer to the stop line
    N: {
        align: "items-end",
        justify: "justify-center",
        style: { paddingBottom: 10 },
    },
    S: {
        align: "items-start",
        justify: "justify-center",
        style: { paddingTop: 10 },
    },
    E: {
        align: "items-center",
        justify: "justify-start",
        style: { paddingLeft: 10 },
    },
    W: {
        align: "items-center",
        justify: "justify-end",
        style: { paddingRight: 10 },
    },
};

/* ── Pavement Lane Arrow ──────────────────────────────────────── */
function LaneArrow({ direction }: { direction: "N" | "S" | "E" | "W" }) {
    let incomingPos = "";
    let incomingRot = "";
    let outgoingPos = "";
    let outgoingRot = "";

    // Right-hand traffic logic
    switch (direction) {
        case "N": // Top road. Incoming traffic drives South (right/West lane). Outgoing drives North (left/East lane).
            incomingPos = "bottom-16 left-1/4 -translate-x-1/2";
            incomingRot = "rotate-180";
            outgoingPos = "bottom-16 right-1/4 translate-x-1/2";
            outgoingRot = "rotate-0";
            break;
        case "S": // Bottom road. Incoming traffic drives North (right/East lane). Outgoing drives South (left/West lane).
            incomingPos = "top-16 right-1/4 translate-x-1/2";
            incomingRot = "rotate-0";
            outgoingPos = "top-16 left-1/4 -translate-x-1/2";
            outgoingRot = "rotate-180";
            break;
        case "E": // Right road. Incoming traffic drives West (top/North lane). Outgoing drives East (bottom/South lane).
            incomingPos = "left-16 top-1/4 -translate-y-1/2";
            incomingRot = "-rotate-90";
            outgoingPos = "left-16 bottom-1/4 translate-y-1/2";
            outgoingRot = "rotate-90";
            break;
        case "W": // Left road. Incoming traffic drives East (bottom/South lane). Outgoing drives West (top/North lane).
            incomingPos = "right-16 bottom-1/4 translate-y-1/2";
            incomingRot = "rotate-90";
            outgoingPos = "right-16 top-1/4 -translate-y-1/2";
            outgoingRot = "-rotate-90";
            break;
    }

    const ArrowSVG = ({ pos, rot }: { pos: string; rot: string }) => (
        <div
            className={`absolute ${pos} ${rot} pointer-events-none opacity-40 z-10`}
            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
        >
            <svg
                width="28"
                height="72"
                viewBox="0 0 24 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* A stretched, authentic pavement arrow */}
                <path d="M12 2L2 22H8V62H16V22H22L12 2Z" fill="#ffffff" />
            </svg>
        </div>
    );

    return (
        <>
            <ArrowSVG pos={incomingPos} rot={incomingRot} />
            <ArrowSVG pos={outgoingPos} rot={outgoingRot} />
        </>
    );
}

/* ── Road Cell with Pod ───────────────────────────────────────── */
function RoadCell({
    direction,
}: {
    direction: "N" | "S" | "E" | "W";
}) {
    const { phase, secondsRemaining } = useTrafficLight(
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

            <LaneArrow direction={direction} />

            {/* Traffic light pod at the edge of the stopline */}
            <div style={pos.style} className="z-20 relative">
                <TrafficLightPod
                    direction={direction}
                    phase={phase}
                    secondsRemaining={secondsRemaining}
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
                // Expand the center massively: minimum 360px up to 45vw
                gridTemplateColumns: "1fr min(45vw, 360px) 1fr",
                gridTemplateRows: "1fr min(45vw, 360px) 1fr",
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
