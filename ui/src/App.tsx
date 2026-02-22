import { useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { IntersectionGrid } from "@/components/IntersectionGrid";

function App() {
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
    <div className="w-screen h-screen overflow-hidden relative">
      <ThemeToggle />
      <IntersectionGrid />
    </div>
  );
}

export default App;
