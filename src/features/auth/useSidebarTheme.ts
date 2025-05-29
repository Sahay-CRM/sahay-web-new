import { useContext } from "react";
import { SidebarThemeContext } from "./SidebarThemeContext";

export const useSidebarTheme = () => {
  const context = useContext(SidebarThemeContext);
  if (!context) {
    throw new Error(
      "useSidebarTheme must be used within a SidebarThemeProvider",
    );
  }
  return context;
};
