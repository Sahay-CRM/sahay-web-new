import { createContext } from "react";

const SidebarControlContext = createContext<
  | {
      open: boolean;
      setOpen: (open: boolean) => void;
    }
  | undefined
>(undefined);
export default SidebarControlContext;
