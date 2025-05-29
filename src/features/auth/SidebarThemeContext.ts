import { createContext } from "react";

export interface SidebarThemeContextType {
  bgColor: string;
  setBgColor: (color: string) => void;
}

export const SidebarThemeContext = createContext<
  SidebarThemeContextType | undefined
>(undefined);
