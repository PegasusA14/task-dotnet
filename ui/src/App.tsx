import { createContext, useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { IntersectionGrid } from "@/components/IntersectionGrid";
import { useIntersection, TrafficContext } from "@/hooks/useIntersection";
import { ConnectionStatusBadge } from "@/components/ConnectionStatusBadge";
import { Eye, Zap } from "lucide-react";

/** Global UI toggle context */
export interface UIToggles {
  showAllCards: boolean;
  highlightActive: boolean;
}
export const UIToggleContext = createContext<UIToggles>({ showAllCards: false, highlightActive: false });

function App() {
  const intersectionData = useIntersection();
  const [showAllCards, setShowAllCards] = useState(false);
  const [highlightActive, setHighlightActive] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = stored ? stored === "dark" : true;
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <TrafficContext.Provider value={intersectionData}>
      <UIToggleContext.Provider value={{ showAllCards, highlightActive }}>
        <div className="w-screen h-screen overflow-hidden relative">
          {/* Top right controls */}
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
            {/* Show All Cards Toggle */}
            <button
              onClick={() => setShowAllCards((v) => !v)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full
                   border border-[var(--border)] backdrop-blur-md
                   cursor-pointer transition-all duration-300 ease-out
                   text-[10px] tracking-[0.2em] uppercase font-medium
                   ${showAllCards
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                  : "bg-[var(--card)]/80 text-[var(--foreground)] hover:bg-[var(--accent)]"
                }`}
              aria-label="Show all cards"
            >
              <Eye size={13} strokeWidth={1.8} />
              <span>CARDS</span>
            </button>

            {/* Highlight Active Toggle */}
            <button
              onClick={() => setHighlightActive((v) => !v)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full
                   border border-[var(--border)] backdrop-blur-md
                   cursor-pointer transition-all duration-300 ease-out
                   text-[10px] tracking-[0.2em] uppercase font-medium
                   ${highlightActive
                  ? "bg-green-500/20 text-green-400 border-green-500/40"
                  : "bg-[var(--card)]/80 text-[var(--foreground)] hover:bg-[var(--accent)]"
                }`}
              aria-label="Highlight active"
            >
              <Zap size={13} strokeWidth={1.8} />
              <span>FOCUS</span>
            </button>

            <ThemeToggle />
          </div>

          <ConnectionStatusBadge status={intersectionData.connectionStatus} />
          <IntersectionGrid />
        </div>
      </UIToggleContext.Provider>
    </TrafficContext.Provider>
  );
}

export default App;
