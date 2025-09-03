import { useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import {
  SidebarThemeContext,
  SidebarThemeContextType,
} from "./SidebarThemeContext";

interface SidebarThemeProviderProps {
  children: ReactNode;
}

export const SidebarThemeProvider = ({
  children,
}: SidebarThemeProviderProps) => {
  const [bgColor, setBgColorState] = useState<string>("white");

  useEffect(() => {
    const storedColor = localStorage.getItem("SIDEBAR_BG_COLOR");
    if (storedColor) {
      setBgColorState(storedColor);
    }
  }, []);

  const setBgColor = useCallback((color: string) => {
    setBgColorState(color);
    localStorage.setItem("SIDEBAR_BG_COLOR", color);
  }, []);

  const memoValue = useMemo<SidebarThemeContextType>(() => {
    return {
      bgColor,
      setBgColor,
    };
  }, [bgColor, setBgColor]);

  return (
    <SidebarThemeContext.Provider value={memoValue}>
      {children}
    </SidebarThemeContext.Provider>
  );
};
