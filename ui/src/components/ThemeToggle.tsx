import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("theme");
            return stored ? stored === "dark" : true; // Default dark
        }
        return true;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("theme", isDark ? "dark" : "light");
    }, [isDark]);

    return (
        <button
            onClick={() => setIsDark((d) => !d)}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full
                 border border-[var(--border)] backdrop-blur-md
                 bg-[var(--card)]/80 text-[var(--foreground)]
                 hover:bg-[var(--accent)] cursor-pointer
                 transition-all duration-300 ease-out
                 text-[10px] tracking-[0.2em] uppercase font-medium"
            aria-label="Toggle theme"
        >
            {isDark ? (
                <Moon size={13} strokeWidth={1.8} />
            ) : (
                <Sun size={13} strokeWidth={1.8} />
            )}
            <span>{isDark ? "DARK" : "LIGHT"}</span>
        </button>
    );
}
