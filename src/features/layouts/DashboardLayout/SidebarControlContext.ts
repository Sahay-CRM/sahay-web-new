import { createContext } from "react";

export const SidebarControlContext = createContext<
  | {
      open: boolean;
      setOpen: (open: boolean) => void;
    }
  | undefined
>(undefined);
