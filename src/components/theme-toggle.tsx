import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 animate-in fade-in-0 zoom-in-95" />
      ) : (
        <Moon className="h-5 w-5 animate-in fade-in-0 zoom-in-95" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};

export default ThemeToggle;
