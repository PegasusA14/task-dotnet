import { AnimatePresence, motion } from "framer-motion";
import type { ConnectionStatus } from "../hooks/useSignalRConnection";

export function ConnectionStatusBadge({ status }: { status: ConnectionStatus }) {
    const config = {
        connected: { text: "LIVE", color: "bg-green-500", textCol: "text-green-500" },
        connecting: { text: "CONNECTING", color: "bg-yellow-500", textCol: "text-yellow-500" },
        reconnecting: { text: "RECONNECTING", color: "bg-orange-500", textCol: "text-orange-500" },
        disconnected: { text: "OFFLINE", color: "bg-red-500", textCol: "text-red-500" },
    }[status];

    return (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur shadow-sm">
            <div className="relative flex items-center justify-center w-2 h-2">
                {status !== "disconnected" && (
                    <div
                        className={`absolute w-full h-full rounded-full ${config.color} opacity-40 ${status === "connecting" ? "animate-ping" : "animate-pulse"}`}
                    />
                )}
                <div className={`w-2 h-2 rounded-full ${config.color}`} />
            </div>
            <div className="relative w-24 h-4 overflow-hidden flex items-center">
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                        key={status}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`text-[10px] tracking-widest font-mono font-bold ${config.textCol}`}
                    >
                        {config.text}
                    </motion.span>
                </AnimatePresence>
            </div>
        </div>
    );
}
