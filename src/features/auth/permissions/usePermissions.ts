import { useContext } from "react";
import { PermissionsContextType } from "./permissions.interface";
import { PermissionsContext } from "./PermissionContext";

export const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
};
