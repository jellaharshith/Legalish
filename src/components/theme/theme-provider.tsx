import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove any existing theme classes
    root.classList.remove("light", "dark");
    
    // Always apply dark theme
    root.classList.add("dark");
    
    // Set CSS custom properties for brand colors
    root.style.setProperty('--brand-primary', '299 45% 64%');
    root.style.setProperty('--brand-destructive', '9 64% 56%');
    root.style.setProperty('--brand-base', '220 33% 37%');
    root.style.setProperty('--brand-deep', '267 35% 24%');
    root.style.setProperty('--brand-white', '0 0% 100%');
  }, []);

  const value = {
    theme: "dark" as Theme,
    setTheme: (theme: Theme) => {
      // Always keep dark theme - this is a dark-mode-only app
      localStorage.setItem(storageKey, "dark");
      setTheme("dark");
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};