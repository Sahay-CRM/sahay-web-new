import { createContext } from "react";
import { PermissionsContextType } from "./permissions.interface";

export const PermissionsContext = createContext<
  PermissionsContextType | undefined
>(undefined);
