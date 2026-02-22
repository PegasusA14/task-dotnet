import { useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { IntersectionGrid } from "@/components/IntersectionGrid";
import { useIntersection, TrafficContext } from "@/hooks/useIntersection";
import { ConnectionStatusBadge } from "@/components/ConnectionStatusBadge";

function App() {
  const intersectionData = useIntersection();

  // Initialize dark mode on mount
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
      <div className="w-screen h-screen overflow-hidden relative">
        <ThemeToggle />
        <ConnectionStatusBadge status={intersectionData.connectionStatus} />
        <IntersectionGrid />
      </div>
    </TrafficContext.Provider>
  );
}

export default App;
